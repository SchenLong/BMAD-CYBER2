# Create Project - Instructions

<critical>The workflow execution engine is governed by: {project-root}/_bmad/core/tasks/workflow.xml</critical>
<critical>You MUST have already loaded and processed: create-project/workflow.yaml</critical>
<critical>Communicate in {communication_language} with {user_name}</critical>

<workflow>

<step n="1" goal="Gather project basics">
<output>Let's set up your new project, {user_name}!</output>

<ask>What's the **name** of this project?</ask>
<action>Store as project_name</action>
<action>Generate project_id as lowercase slug (spaces to hyphens, no special chars)</action>

<ask>Give me a **brief description** (1-2 sentences) of what this project is about:</ask>
<action>Store as project_description</action>

<template-output>project_name</template-output>
<template-output>project_id</template-output>
<template-output>project_description</template-output>
</step>

<step n="2" goal="Determine project path">
<action>Check if current working directory seems appropriate for this project</action>

<ask>Where should this project live?

1. **Current directory** - Use {project-root} (recommended if you're already in the project folder)
2. **Specify path** - Enter a different absolute path

Choice [1/2]:</ask>

<check if="choice == 1">
  <action>Set project_path = {project-root}</action>
</check>

<check if="choice == 2">
  <ask>Enter the absolute path to the project root:</ask>
  <action>Validate path exists or offer to create it</action>
  <action>Store as project_path</action>
</check>

<template-output>project_path</template-output>
</step>

<step n="3" goal="Determine project type">
<ask>Is this a **greenfield** (new) or **brownfield** (existing codebase) project?

1. **Greenfield** - Starting fresh, no existing code
2. **Brownfield** - Existing codebase to enhance or modify

Choice [1/2]:</ask>

<action>Set project_type based on choice (greenfield/brownfield)</action>
<template-output>project_type</template-output>
</step>

<step n="4" goal="Select modules">
<output>Which BMAD modules will this project use? Select all that apply:

**Development Modules:**
1. **BMM** - Software development (PRD, architecture, epics, stories)
2. **BMGD** - Game development (GDD, game architecture, playtesting)

**Specialist Teams:**
3. **Cybersec Team** - Security assessments, threat modeling, compliance
4. **Intel Team** - OSINT, threat intelligence, investigations
5. **Strategy Team** - Executive advisory, strategic planning
6. **Legal Team** - Legal consultation (Party Mode support)

</output>

<ask>Enter module numbers separated by commas (e.g., "1,3,5" or "1" for just BMM):</ask>

<action>Parse selection and build modules_used array:
- 1 → bmm
- 2 → bmgd
- 3 → cybersec-team
- 4 → intel-team
- 5 → strategy-team
- 6 → legal-team
</action>

<check if="no modules selected">
  <output>At least one module must be selected. BMM is recommended for most software projects.</output>
  <action>Loop back to selection</action>
</check>

<template-output>modules_used</template-output>
</step>

<step n="5" goal="Configure LLM provider">
<output>**LLM Provider Configuration**

BMAD supports multiple LLM providers. Let me show you what's available and help you choose.
</output>

<action>Load {project-root}/_bmad/_config/llm-config.yaml to get all available providers</action>
<action>Run `.claude/hooks/llm-provider-manager.sh health-all` to check which providers are currently available</action>

<output>**Available LLM Providers:**

**Cloud/API Providers:**
1. **claude** (Recommended) - Anthropic's Claude via Claude Code CLI
   - Best quality, full tool support, 200k context window
   - Native integration with Claude Code

2. **openai** - OpenAI API (GPT-4, etc.)
   - Requires OPENAI_API_KEY environment variable
   - Good tool support, 128k context

3. **groq** - Groq Cloud (ultra-fast inference)
   - Requires GROQ_API_KEY environment variable
   - Very fast responses, good for iteration

4. **together** - Together AI (serverless inference)
   - Requires TOGETHER_API_KEY environment variable
   - Wide model selection

**Local/On-Premise Providers:**
5. **ollama** - Ollama server (most popular local option)
   - Run any open-source model locally
   - Data stays on your machine, no API costs
   - Default: llama3.1:70b

6. **vllm** - High-performance vLLM server
   - Best performance for local serving
   - OpenAI-compatible API

7. **lmstudio** - LM Studio local server
   - GUI-based model management
   - Easy to use for beginners

8. **llamacpp** - Direct llama.cpp server
   - Lightweight, minimal dependencies
   - Good for resource-constrained environments

</output>

<ask>Which LLM provider would you like to use?

Enter the provider name (claude/openai/groq/together/ollama/vllm/lmstudio/llamacpp):</ask>

<action>Store user choice as llm_provider</action>

<!-- HANDLE LOCAL PROVIDERS - Test connection and setup -->
<check if="llm_provider in ['ollama', 'vllm', 'lmstudio', 'llamacpp']">
  <output>Testing connection to **{llm_provider}**...</output>
  <action>Run: `.claude/hooks/llm-provider-manager.sh health {llm_provider}`</action>

  <check if="health check succeeds">
    <output>✅ **Connection successful!** {llm_provider} server is running and responding.</output>

    <check if="llm_provider == 'ollama'">
      <action>Run: `curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4` to list available models</action>
      <output>**Available Ollama models:**</output>
      <action>Display the list of models from the curl command</action>
      <action>Read current model from llm-config.yaml</action>
      <ask>Current configured model is **{current_model}**. Would you like to:
1. Keep this model
2. Choose a different model from the list above
3. Pull a new model (I'll help you download it)

Choice [1/2/3]:</ask>
      <check if="choice == 2">
        <ask>Enter the model name from the list above:</ask>
        <action>Update llm-config.yaml with new model selection</action>
      </check>
      <check if="choice == 3">
        <ask>Which model would you like to pull? (e.g., llama3.1:70b, mistral:7b, codellama:34b):</ask>
        <action>Run: `ollama pull {model_name}`</action>
        <output>Pulling model... this may take a few minutes depending on model size.</output>
        <action>Wait for pull to complete</action>
        <action>Update llm-config.yaml with new model selection</action>
      </check>
    </check>

    <check if="llm_provider == 'vllm'">
      <action>Run: `curl -s http://localhost:8000/v1/models` to verify model</action>
      <output>vLLM server model verified.</output>
    </check>

    <check if="llm_provider == 'lmstudio'">
      <action>Run: `curl -s http://localhost:1234/v1/models` to verify model</action>
      <output>LM Studio server verified. Make sure you have a model loaded in LM Studio.</output>
    </check>
  </check>

  <check if="health check fails">
    <output>⚠️ **{llm_provider} server is not running.**</output>

    <check if="llm_provider == 'ollama'">
      <output>**To start Ollama:**
```bash
# Start the Ollama server
ollama serve

# In another terminal, pull a model if needed
ollama pull llama3.1:70b
```
</output>
    </check>

    <check if="llm_provider == 'vllm'">
      <output>**To start vLLM:**
```bash
# Install vLLM
pip install vllm

# Start the server
python -m vllm.entrypoints.openai.api_server --model meta-llama/Llama-3.1-70B-Instruct
```
</output>
    </check>

    <check if="llm_provider == 'lmstudio'">
      <output>**To start LM Studio:**
1. Open LM Studio application
2. Load a model from the Models tab
3. Go to Local Server tab and click "Start Server"
</output>
    </check>

    <check if="llm_provider == 'llamacpp'">
      <output>**To start llama.cpp server:**
```bash
# Navigate to llama.cpp directory
./server -m /path/to/model.gguf -c 4096 --port 8080
```
</output>
    </check>

    <ask>Would you like to:
1. **Wait** - I'll test the connection again after you start the server
2. **Continue anyway** - Set up the config, start the server later
3. **Choose different provider** - Pick another option

Choice [1/2/3]:</ask>

    <check if="choice == 1">
      <ask>Press Enter when the server is running...</ask>
      <action>Run health check again</action>
      <check if="still fails">
        <output>Still unable to connect. Please verify the server is running on the correct port.</output>
        <action>Continue with setup, note that server needs to be started</action>
      </check>
    </check>

    <check if="choice == 3">
      <action>Go back to provider selection</action>
    </check>
  </check>
</check>

<!-- HANDLE CLOUD API PROVIDERS - Check for API keys -->
<check if="llm_provider in ['openai', 'groq', 'together']">
  <output>Checking API configuration for **{llm_provider}**...</output>
  <action>Run: `.claude/hooks/llm-provider-manager.sh health {llm_provider}`</action>

  <check if="API key not configured">
    <output>⚠️ **API key not configured for {llm_provider}.**</output>

    <check if="llm_provider == 'openai'">
      <output>**To configure OpenAI:**
```bash
export OPENAI_API_KEY="your-api-key-here"
```
Add to your shell profile (~/.bashrc, ~/.zshrc) for persistence.</output>
    </check>

    <check if="llm_provider == 'groq'">
      <output>**To configure Groq:**
```bash
export GROQ_API_KEY="your-api-key-here"
```
Get your API key at: https://console.groq.com/keys</output>
    </check>

    <check if="llm_provider == 'together'">
      <output>**To configure Together AI:**
```bash
export TOGETHER_API_KEY="your-api-key-here"
```
Get your API key at: https://api.together.xyz/settings/api-keys</output>
    </check>

    <ask>Would you like to:
1. **Continue anyway** - Set up the config, add API key later
2. **Choose different provider** - Pick another option

Choice [1/2]:</ask>

    <check if="choice == 2">
      <action>Go back to provider selection</action>
    </check>
  </check>

  <check if="API key configured">
    <output>✅ **API key configured!** {llm_provider} is ready to use.</output>
  </check>
</check>

<!-- HANDLE CLAUDE - Native integration -->
<check if="llm_provider == 'claude'">
  <output>✅ **Claude selected.** Using native Claude Code CLI integration - no additional setup required!</output>
</check>

<!-- SECURITY WARNING FOR SENSITIVE MODULES WITH CLOUD PROVIDERS -->
<check if="(cybersec-team in modules_used OR intel-team in modules_used) AND llm_provider in ['openai', 'groq', 'together']">
  <output>
⚠️ **SECURITY WARNING** ⚠️

You've selected **Cybersec Team** and/or **Intel Team** modules with **{llm_provider}** (a third-party cloud provider).

**Risks:**
- Sensitive security findings, vulnerabilities, and threat intelligence will be sent to {llm_provider}'s servers
- Investigation data, IOCs, and threat actor information will transit over the internet
- Third-party API providers may log or store your queries per their data retention policies

**Recommendations:**
- Use **local LLM** (Ollama, vLLM) for cybersec and intel work to keep data on-premise
- Use **Claude** if you trust Anthropic's data handling (enterprise agreements available)
- If using {llm_provider}, ensure your organization's security policy allows it
- Consider data classification before processing sensitive information

</output>
  <ask>Do you understand the risks and wish to proceed with {llm_provider}? (y/n):</ask>
  <check if="n">
    <output>Let's choose a more secure option for your cybersec/intel work.</output>
    <ask>Switch to:
1. **ollama** - Local, data stays on your machine
2. **claude** - Anthropic's API with enterprise data handling

Choice [1/2]:</ask>
    <check if="choice == 1">
      <action>Set llm_provider = "ollama"</action>
      <action>Run health check for ollama</action>
    </check>
    <check if="choice == 2">
      <action>Set llm_provider = "claude"</action>
    </check>
  </check>
</check>

<!-- POSITIVE CONFIRMATION FOR LOCAL WITH SENSITIVE MODULES -->
<check if="(cybersec-team in modules_used OR intel-team in modules_used) AND llm_provider in ['ollama', 'vllm', 'lmstudio', 'llamacpp']">
  <output>✅ **Excellent security choice!** Using local LLM ({llm_provider}) for cybersec/intel work keeps all sensitive data on your machine.</output>
</check>

<!-- FINAL CONNECTION TEST AND CONFIRMATION -->
<output>**Final Integration Check...**</output>
<action>Run: `.claude/hooks/llm-provider-manager.sh health {llm_provider}`</action>
<action>Run: `.claude/hooks/llm-provider-manager.sh config {llm_provider}` to get configuration details</action>

<output>
**LLM Provider Configuration Complete!**

| Setting | Value |
|---------|-------|
| Provider | {llm_provider} |
| Type | {provider_type} |
| Status | {connection_status} |
</output>

<check if="llm_provider in ['ollama', 'vllm', 'lmstudio', 'llamacpp']">
  <output>| Base URL | {base_url} |
| Model | {model} |</output>
</check>

<action>Update project's LLM configuration:
- Run: `.claude/hooks/llm-provider-manager.sh set {llm_provider}`
</action>

<output>✅ **LLM provider set to {llm_provider}** - All BMAD agents in this project will use this provider.</output>

<template-output>llm_provider</template-output>
</step>

<step n="6" goal="Configure folder structure (was step 5)">
<output>Default folder structure:

```
{project_path}/
├── _bmad-output/
│   ├── planning-artifacts/    # PRD, architecture, epics
│   └── implementation-artifacts/    # Stories, sprint status
├── docs/                      # Project documentation
└── src/                       # Source code (if applicable)
```
</output>

<ask>Use default folder structure? (y/n)</ask>

<check if="y">
  <action>Set folder_structure to defaults:
    - planning: "_bmad-output/planning-artifacts"
    - implementation: "_bmad-output/implementation-artifacts"
    - docs: "docs"
  </action>
</check>

<check if="n">
  <ask>Enter planning artifacts folder (relative to project root):</ask>
  <action>Store as folder_structure.planning</action>
  <ask>Enter implementation artifacts folder (relative to project root):</ask>
  <action>Store as folder_structure.implementation</action>
  <ask>Enter documentation folder (relative to project root):</ask>
  <action>Store as folder_structure.docs</action>
</check>

<template-output>folder_structure</template-output>
</step>

<step n="7" goal="Create folders and registry">
<action>Create folder structure if it doesn't exist:
- {project_path}/{folder_structure.planning}
- {project_path}/{folder_structure.implementation}
- {project_path}/{folder_structure.docs}
</action>

<action>Load or create {output_folder}/project-registry.yaml</action>

<action>Build new project entry:
```yaml
- id: "{project_id}"
  name: "{project_name}"
  description: "{project_description}"
  path: "{project_path}"
  type: "{project_type}"
  modules_used: {modules_used}
  llm_provider: "{llm_provider}"
  status: "new"
  current_phase: "discovery"
  created: "{date}"
  last_accessed: "{date}"
  folder_structure:
    planning: "{folder_structure.planning}"
    implementation: "{folder_structure.implementation}"
    docs: "{folder_structure.docs}"
  workflow_status_files: {}
  notes: ""
```
</action>

<action>Add project to registry's projects array</action>
<action>Set registry's active_project to project_id</action>
<action>Update registry's last_updated to current date</action>
<action>Save registry to {output_folder}/project-registry.yaml</action>

<output>Project **{project_name}** created successfully!

**Project ID:** {project_id}
**Location:** {project_path}
**Type:** {project_type}
**Modules:** {modules_used}
**LLM Provider:** {llm_provider}

**Folders created:**
- {folder_structure.planning}
- {folder_structure.implementation}
- {folder_structure.docs}
</output>
</step>

<step n="8" goal="Offer next steps">
<output>**What's Next?**</output>

<check if="bmm in modules_used">
  <output>For software development (BMM), I recommend:
  - **Initialize BMM workflow** - Run the BMM workflow-init to set up your planning path
  - **PM Agent (John)** - Start with PRD creation to define requirements
  </output>
</check>

<check if="bmgd in modules_used">
  <output>For game development (BMGD), I recommend:
  - **Initialize BMGD workflow** - Run the BMGD workflow-init to set up your game planning
  - **Game Designer (Samus)** - Start with Game Brief or GDD creation
  </output>
</check>

<check if="cybersec-team in modules_used">
  <output>For security work (Cybersec Team), available workflows include:
  - **Security Architecture Review** - Assess system security
  - **Threat Modeling** - STRIDE analysis
  - **Compliance Audit** - Regulatory compliance check
  </output>
</check>

<ask>Would you like me to:

1. **Run module workflow-init** - Initialize the primary module's workflow tracking
2. **Show What's Next** - Let me analyze and recommend the best first step
3. **Return to menu** - Go back to Abdul's main menu

Choice [1/2/3]:</ask>

<check if="choice == 1">
  <check if="bmm in modules_used">
    <output>Invoking BMM workflow-init...</output>
    <action>Execute {project-root}/_bmad/bmm/workflows/workflow-status/init/workflow.yaml</action>
  </check>
  <check if="bmgd in modules_used AND bmm not in modules_used">
    <output>Invoking BMGD workflow-init...</output>
    <action>Execute {project-root}/_bmad/bmgd/workflows/workflow-status/init/workflow.yaml</action>
  </check>
</check>

<check if="choice == 2">
  <output>Analyzing project state...</output>
  <action>Execute {project-root}/_bmad/core/workflows/project-manager/whats-next/workflow.yaml</action>
</check>

<check if="choice == 3">
  <output>Returning to Abdul's menu. Use [WN] for What's Next recommendations anytime!</output>
  <action>Return to agent menu</action>
</check>
</step>

</workflow>
