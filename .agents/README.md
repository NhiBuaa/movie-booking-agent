# Project Agent Configuration

`.agents/` contains project-local configuration that helps coding agents work consistently in this repository.

It is not a task tracker and must not duplicate Issue or Pull Request state.

## Structure

```text
.agents/
├── README.md
├── rules/
│   ├── README.md
│   ├── codegraph.md
│   └── ui-skill-routing.md
├── skills/
│   └── speckit-*/
│       └── SKILL.md
└── references/
    └── README.md
```

## Rules

`.agents/rules/` contains detailed or scoped rules that apply specifically to agent behavior.

Use it for instructions such as Git safety, agent editing discipline, or scoped behavior that would make the root `AGENTS.md` too large.

If a rule must also be obeyed by human developers or by the software itself, it belongs in `docs/04-standards/` instead.

## References

`.agents/references/` contains non-normative supporting material for agents: examples, patterns, lookup notes, or curated references.

References do not override `AGENTS.md`, Standards, Specifications, ADRs, source code, or tests.

## Spec Kit Integration

Keep the project-local `speckit-*` skills managed by the
[Codex integration manifest](../.specify/integrations/codex.manifest.json).
They support the Spec Kit workflow required by `AGENTS.md`, using this project's `.specify/`
configuration and feature specifications. Global planning/interview skills may complement that
workflow; similar descriptions alone do not make them interchangeable with this integration.

This is the concrete need that justifies `.agents/skills/`. The exception covers only the Spec Kit
integration, not arbitrary custom skills or copies of personal global skills. Keep generated skills
with their integration metadata; evaluate changes as part of a Spec Kit integration update.

The external `check-kit.ps1` currently warns whenever `.agents/skills/` exists, without checking
this justification or the integration manifest. Record that warning as a known checker limitation;
do not remove the integration or disable other checks just to obtain a warning-free result.

## What Does Not Belong Here

Do not use `.agents/` for:

- task plans;
- progress logs;
- handoffs;
- PR reviews;
- verification evidence;
- project-local copies of global personal skills.

Use Issues and Pull Requests for work state.

## Điểm vào công cụ của dự án

[Danh mục rules](rules/README.md) dẫn tới CodeGraph và quy trình UI theo ứng dụng.
[Hướng dẫn công cụ](../docs/07-guides/development-tools.md) giải thích thao tác Impeccable/CodeGraph;
công cụ không thay quyền sửa repo hoặc bằng chứng kiểm thử/chạy thực tế.
