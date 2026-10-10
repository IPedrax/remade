# Microsoft Project request

Target Microsoft Project Desktop, including the desktop capabilities associated with Planner and Project Plan 3 and Plan 5. Suggested names: **ProjectCraft** and **GanttCraft**. The catalog request lives at `src/content/catalog/requests/microsoft/microsoft-project.yaml`.

## Requested compatibility

- Interactive Gantt timelines, dependent tasks, milestones, critical paths and baselines.
- Multiple resource assignments, over-allocation warnings, automatic leveling and custom calendars.
- Earned value analysis: schedule variance (SV), cost variance (CV), schedule performance index (SPI) and cost performance index (CPI).
- Rate tables, fixed task costs, cost curves and baseline-versus-actual variance tracking.
- MPP and XML import/export; XER exchange as an additional interoperability goal, rather than a claim that it is a native Microsoft Project format. PDF and CSV export.
- CLI and Model Context Protocol (MCP) automation for agent integrations.

## Proposed implementation goals

Rust is a suggested implementation choice, with parallel recalculation of dependency graphs containing 10,000 or more tasks, responsive timeline navigation targeting 60 FPS, and background Monte Carlo risk simulations that keep the interface usable. WebGPU, Metal, Vulkan and DirectX are possible rendering backends.

These are requested design and performance goals, not measured results or guarantees about an existing implementation.
