use crate::security::{record_id, unavailable};
use serde::{Deserialize, Serialize};
use wasm_bindgen::JsValue;
use worker::{D1Database, Result};

#[derive(Deserialize)]
pub struct GithubUser {
    pub id: u64,
    pub login: String,
    pub name: Option<String>,
    pub avatar_url: Option<String>,
}

impl GithubUser {
    pub fn validate(&self) -> Result<()> {
        if self.id == 0
            || self.login.is_empty()
            || self.login.len() > 39
            || !self
                .login
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b == b'-')
            || self.name.as_ref().is_some_and(|v| v.len() > 256)
        {
            return Err(unavailable());
        }
        if let Some(avatar) = &self.avatar_url {
            let url = url::Url::parse(avatar).map_err(|_| unavailable())?;
            if avatar.len() > 2048
                || url.scheme() != "https"
                || url.host_str() != Some("avatars.githubusercontent.com")
                || !url.username().is_empty()
                || url.password().is_some()
            {
                return Err(unavailable());
            }
        }
        Ok(())
    }
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub identities: Vec<Identity>,
}

#[derive(Serialize, Deserialize)]
pub struct Identity {
    pub provider: String,
    pub username: String,
}

#[derive(Deserialize)]
pub struct UserRow {
    pub id: String,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub username: String,
}

impl From<UserRow> for User {
    fn from(row: UserRow) -> Self {
        Self {
            id: row.id,
            display_name: row.display_name,
            avatar_url: row.avatar_url,
            identities: vec![Identity {
                provider: "github".into(),
                username: row.username,
            }],
        }
    }
}

async fn find_identity(db: &D1Database, provider_id: &str) -> Result<Option<UserRow>> {
    db.prepare("SELECT u.id, u.display_name, u.avatar_url, i.username FROM users u JOIN user_identities i ON i.user_id = u.id WHERE i.provider = 'github' AND i.provider_user_id = ?")
        .bind(&[provider_id.into()])?.first(None).await
}

pub async fn resolve_identity(db: &D1Database, github: &GithubUser) -> Result<String> {
    github.validate()?;
    let provider_id = github.id.to_string();
    if let Some(user) = find_identity(db, &provider_id).await? {
        let statements = vec![
            db.prepare("UPDATE users SET display_name = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(&[optional(&github.name), optional(&github.avatar_url), user.id.clone().into()])?,
            db.prepare("UPDATE user_identities SET username = ? WHERE provider = 'github' AND provider_user_id = ?").bind(&[github.login.clone().into(), provider_id.into()])?,
        ];
        db.batch(statements).await?;
        return Ok(user.id);
    }
    let user_id = record_id()?;
    let identity_id = record_id()?;
    let statements = vec![
        db.prepare("INSERT INTO users (id, display_name, avatar_url) VALUES (?, ?, ?)").bind(&[user_id.clone().into(), optional(&github.name), optional(&github.avatar_url)])?,
        db.prepare("INSERT INTO user_identities (id, user_id, provider, provider_user_id, username) VALUES (?, ?, 'github', ?, ?)").bind(&[identity_id.into(), user_id.clone().into(), provider_id.clone().into(), github.login.clone().into()])?,
    ];
    // D1 rolls back the entire batch if the unique identity constraint loses a race.
    if db.batch(statements).await.is_ok() {
        return Ok(user_id);
    }
    find_identity(db, &provider_id)
        .await?
        .map(|user| user.id)
        .ok_or_else(unavailable)
}

fn optional(value: &Option<String>) -> JsValue {
    value
        .as_ref()
        .map_or(JsValue::NULL, |v| JsValue::from_str(v))
}
