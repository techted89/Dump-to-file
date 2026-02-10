# 📂 Dump-to-File (D2F)

![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-1.0.0-green) ![UX](https://img.shields.io/badge/UX-Palette_Approved-pink)

> **The Intelligent Context Bridge & Codebase Snapshotting Tool**
>
> D2F is a specialized CLI utility designed to bridge the gap between your local development environment and the restricted context windows of Large Language Models (LLMs). Through an intuitive Terminal User Interface (TUI), it allows you to curate, bundle, and export your codebase into a single, structured intelligence document.

---

## 🕹️ The TUI Experience
Forget memorizing complex flags. D2F launches a full-screen interactive menu in your terminal:

* **Interactive File Tree:** Navigate your project and toggle files or folders using `Space`.
* **Smart Presets:** One-tap selection for **"Logic Only"** (code), **"Documentation,"** or **"Full Project."**
* **Live Token Estimation:** See an approximate token count of your selection before you dump, ensuring you stay within model limits (e.g., 128k or 200k).
* **Instant Search:** Filter the file tree in real-time to find specific components or modules.
* **Export Profiles:** Choose between **"Human Readable"** or **"Minimalist (Token Saver)"** modes.

---

## 🚀 Strategic Workflows

### 1. The "Model-to-Model" Handover
If you start a feature in **Model A** but need **Model B's** reasoning for a specific bug, use the TUI to select only the relevant modules. Export the dump and paste it into the new model to provide "instant expertise" on the existing logic.

### 2. Feeding the "Blind" Agent
Many AI agents operate in sandboxed environments or via APIs without direct file access. Use D2F to:
* **Initial Load:** Generate a full state dump for the agent's initial "Memory Load."
* **Delta Dumps:** Provide periodic updates of *only* changed files to update the agent's internal context without wasting tokens.

### 3. Contextual RAG Updates
For developers using custom agents with **ChromaDB** or **Vector MMR** memory, D2F acts as the ingestion pipeline. It formats code with clear metadata headers that make it easy for your agent to parse file paths, dependencies, and exports.

---

## 📝 Usage & Commands

To launch the interactive TUI menu:
```bash
d2f
