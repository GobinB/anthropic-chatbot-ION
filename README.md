<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="https://anthropic-chatbot.vercel.rocks/og.png">
  <h1 align="center">Next.js AI Chatbot</h1>
</a>

<p align="center">
  An open-source AI chatbot app template built with Next.js, the Vercel AI SDK, Anthropic Claude, and Vercel KV.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
- React Server Components (RSCs), Suspense, and Server Actions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for streaming chat UI
- Support for Anthropic Claude (default), OpenAI, Gemini, Cohere, Hugging Face, or custom AI chat models and/or LangChain
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - [Radix UI](https://radix-ui.com) for headless component primitives
  - Icons from [Phosphor Icons](https://phosphoricons.com)
- Chat History, rate limiting, and session storage with [Vercel KV](https://vercel.com/storage/kv)
- [NextAuth.js](https://github.com/nextauthjs/next-auth) for authentication

## Model Providers

This template ships with Anthropic Claude `claude-3-haiku` as the default. However, thanks to the [Vercel AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [OpenAI](https://openai.com), [Gemini](https://ai.google.com/), [Cohere](https://cohere.com/), [Hugging Face](https://huggingface.co), or using [LangChain](https://js.langchain.com) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=Next.js+Chat&demo-description=A+full-featured%2C+hackable+Next.js+AI+chatbot+built+by+Vercel+Labs&demo-url=https%3A%2F%2Fchat.vercel.ai%2F&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4aVPvWuTmBvzM5cEdRdqeW%2F4234f9baf160f68ffb385a43c3527645%2FCleanShot_2023-06-16_at_17.09.21.png&project-name=Next.js+Chat&repository-name=nextjs-chat&repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fgemini-chatbot&from=templates&skippable-integrations=1&env=GOOGLE_GENERATIVE_AI_API_KEY%2CAUTH_SECRET&envDescription=How+to+get+these+env+vars&envLink=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fgemini-chatbot%2Fblob%2Fmain%2F.env.example&teamCreateStatus=hidden&stores=[{%22type%22:%22kv%22}])

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various Anthropic and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Authors

---

 export class IONWaterDataAnalyzer {
    private devices: DeviceData[] = []
    private currentDevices: Map<string, DeviceData> = new Map()

    constructor() {
      this.loadDeviceData()  // Loads CSV on startup
    }

  How CSV Reading Works:
  1. File Loading: Reads data/OfflineDevicesHackathon.csv synchronously at startup
  2. Parsing: Splits CSV into rows, maps headers to data fields
  3. Type Conversion: Converts numeric fields (gallons, bathroom_count, etc.)
  4. Snapshot Handling: Groups devices by serial number, keeps latest dbt_updated_at

  Key Data Processing:
  private buildCurrentDeviceMap(): void {
    // Groups devices by serial number
    const deviceGroups = new Map<string, DeviceData[]>()

    // Gets latest snapshot for each device
    deviceGroups.forEach((snapshots, serial) => {
      const latestSnapshot = snapshots.reduce((latest, current) => {
        return new Date(current.dbt_updated_at) > new Date(latest.dbt_updated_at)
          ? current : latest
      })
      this.currentDevices.set(serial, latestSnapshot)
    })
  }

  4. Device Hierarchy Analysis

  The system understands the infrastructure hierarchy:
  - Meters send data to Coordinators/Routers
  - Coordinators/Routers relay to Gateways
  - Gateways send to ION Water System

  Root Cause Detection:
  public getHierarchyIssues(): DeviceHierarchyIssue[] {
    // Find offline gateways and their impact
    const offlineGateways = devices.filter(d =>
      d.device_type === 'gateway' && d.status === 'meter delayed')

    offlineGateways.forEach(gateway => {
      const affectedDevices = devices.filter(d =>
        d.property_name === gateway.property_name &&
        d.status === 'meter delayed')
      // Creates hierarchy issue with severity based on impact
    })
  }

When the AI decides to use a tool:

  1. Tool Definition: Each tool has a Zod schema defining parameters
  export const definition = tool({
    description: 'Show comprehensive device status summary...',
    parameters: z.object({
      includeHierarchyAnalysis: z.boolean().default(true)
    })
  })

  2. Tool Execution: AI service calls the tool with parameters
  export const call = (args, aiState, uiStream) => {
    const summary = ionWaterData.getDeviceStatusSummary()
    const hierarchyIssues = ionWaterData.getHierarchyIssues()
    // Updates UI stream with results
  }

  3. UI Rendering: Tool returns React components for display
  export const UIFromAI = (args) => (
    <BotCard>
      <div className="space-y-4 p-4">
        <h3>Device Status Summary</h3>
        {/* Rich UI showing device status, charts, action items */}
      </div>
    </BotCard>
  )

  How the Chatbot Works Now

  7. User Interaction Flow

  1. User starts chat → Empty screen shows ION Water welcome message
  2. User asks question → AI processes with ION Water context
  3. AI analyzes request → Determines if tools are needed
  4. Tool execution → Calls appropriate ION Water tools
  5. Data analysis → Tools query CSV data, perform analysis
  6. Response generation → AI combines tool results with expertise
  7. UI update → Streaming components show rich technical information

  8. Automatic Initial Analysis

  When a user asks for status or starts a conversation:
  export async function getInitialDeviceAnalysis() {
    service.appendMessage({
      role: 'user',
      content: 'Please provide an initial device status summary...'
    })
    // AI automatically calls deviceStatusSummary tool
  }

  9. Real-time Data Integration

  The CSV data is loaded once at startup and cached in memory:
  - Performance: No file I/O during chat interactions
  - Current Status: Always uses latest dbt_updated_at for each device
  - Hierarchy Analysis: Real-time calculation of upstream/downstream impacts

  Key Features Now Available

  10. Technical Support Capabilities

  - Device Status Dashboard: Real-time overview of all devices
  - Root Cause Analysis: Identifies upstream infrastructure issues
  - Troubleshooting Guidance: Step-by-step procedures for field technicians
  - Priority Recommendations: Focuses on high-impact fixes first
  - Device Search: Find specific devices by serial number or property
  - Connectivity Patterns: Analyzes clustering of offline devices

  11. Professional Interface

  - Header: Shows "💧 ION Water Support Assistant"
  - Welcome Screen: Technical support focused messaging
  - Tool UIs: Professional components suitable for field technicians
