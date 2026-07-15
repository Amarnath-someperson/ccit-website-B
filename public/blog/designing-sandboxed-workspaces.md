---
date: November 2024
tag: Architecture
title: Designing Sandboxed Workspaces
---

The technical challenges and solutions behind secure, isolated development environments.

Building a secure sandbox for agentic code execution requires careful consideration of isolation, resource management, and user safety.

## Core Principles

1. **Process isolation**: Each workspace runs in its own container with minimal privileges
2. **Network control**: Outbound connections are restricted and monitored
3. **Filesystem safety**: Host filesystem is mounted read-only; only workspace directories are writable
4. **Resource limits**: CPU, memory, and disk quotas prevent runaway processes

## Implementation

Our sandbox architecture uses lightweight containers with custom seccomp profiles that block unnecessary system calls while allowing full development flexibility.

The result is a secure environment where agents can experiment freely without risk to the host system or other users.