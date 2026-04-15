# Pasha Tracker - Twitter Thread
## Written as Haroon from Binghamton University / SolaDex

---

**Tweet 1/15:**
🧵 1/15

I'm a CS student at @BinghamtonU and I work at @SolaDex building on @solana

For the past few months, I've been working on something that kept me up way too many nights...

Introducing Pasha Tracker 🕵️‍♂️

A production-grade Solana transaction forensics tool that traces crypto flows beyond surface-level blockchain explorers

Thread below 👇

---

**Tweet 2/15:**
🧵 2/15

The problem:

Current Solana explorers show you individual transactions. But they DON'T show you:

• Where funds actually came from
• If a wallet is connected to an exchange
• Whether funds eventually hit fiat off-ramps
• If multiple wallets are secretly the same entity

This makes tracing stolen funds or analyzing whale behavior nearly impossible

---

**Tweet 3/15:**
🧵 3/15

Working at @SolaDex alongside the @solana team, I saw how much data is publicly available but underutilized

The blockchain is transparent, but extracting meaningful intelligence from it requires tools that don't exist yet

So I built one

---

**Tweet 4/15:**
🧵 4/15

What does Pasha Tracker actually do?

1️⃣ ORIGIN TRACING
Follow funds backward through unlimited hops to find where they came from

2️⃣ EXCHANGE DETECTION
Identify if a wallet belongs to Binance, Coinbase, Kraken, etc.

3️⃣ BUNDLE DETECTION
Find wallets controlled by the same entity (coordinated buying)

4️⃣ FIAT OFF-RAMP FLAGGING
Detect when crypto converts to fiat

---

**Tweet 5/15:**
🧵 5/15

Real-world use cases:

🔍 SECURITY: Exchange got hacked? Trace exactly where the funds went

📊 COMPLIANCE: Verify source of funds for KYC/AML

🐋 RESEARCH: Analyze whale wallet strategies and coordinated movements

🕵️ INVESTIGATIONS: Journalists tracking token manipulation schemes

---

**Tweet 6/15:**
🧵 6/15

The tech stack (because I know you're wondering):

• TypeScript + Node.js
• @solana/web3.js for RPC
• PostgreSQL + Redis for data
• Prisma ORM
• Docker for deployment
• Rate limiting with exponential backoff
• JWT auth + tiered API access
• WebSocket real-time updates
• Jest test suite

Full CI/CD with GitHub Actions

---

**Tweet 7/15:**
🧵 7/15

Some technical details I'm proud of:

✅ All external API calls are rate-limited (200ms delays, exponential backoff on 429s)
✅ Request queue system prevents API abuse
✅ Redis caching for performance
✅ Multi-hop path reconstruction (not just 1-level deep)
✅ Confidence scoring for off-ramp detection

Built for production from day one

---

**Tweet 8/15:**
🧵 8/15

Working on this while balancing:
• Full course load at @BinghamtonU
• Building at @SolaDex
• Occasionally collaborating with the @solana team

Wasn't easy but the Solana ecosystem is worth building for

The community, the speed, the composability - there's nothing else like it

---

**Tweet 9/15:**
🧵 9/15

The codebase:

📁 100+ files
📝 5,500+ lines of TypeScript
🧪 Full test coverage (unit + integration)
📚 Comprehensive documentation (README, Whitepaper, API docs)
🐳 Docker deployment ready
⚡ 5 GitHub Actions workflows

Open source and available now

---

**Tweet 10/15:**
🧵 10/15

What makes this different from existing tools?

Most explorers show you TRANSACTIONS

Pasha Tracker shows you PATHS

It reconstructs the complete money trail - from origin through intermediaries to final destination

Plus real-time monitoring via WebSocket

Plus bundle detection for identifying coordinated actors

---

**Tweet 11/15:**
🧵 11/15

The architecture:

┌─ Client Layer ─┐
├─ API Gateway ──┤ (Express + auth + rate limiting)
├─ Core Services─┤ (Tracer, Indexer, Bundle Detector)
├─ Data Layer ───┤ (PostgreSQL + Redis + Prisma)
└─ Blockchain ───┘ (Solana RPC + Helius)

Modular, scalable, production-ready

---

**Tweet 12/15:**
🧵 12/15

Who is this for?

• Security teams investigating hacks
• Compliance officers doing due diligence
• DeFi researchers analyzing behavior
• Crypto journalists tracing stories
• Exchanges verifying fund sources

Basically anyone who needs to understand crypto flows beyond surface-level data

---

**Tweet 13/15:**
🧵 13/15

Working at @SolaDex taught me how important data transparency is for DeFi

And my courses at @BinghamtonU gave me the theoretical foundation

But building this project taught me more about:
• System design
• API rate limiting
• Database optimization
• Production deployments

Than any class ever could

---

**Tweet 14/15:**
🧵 14/15

The repository is LIVE:

🔗 github.com/HaroonPashaaa/pasha-tracker

Features:
✅ 100+ production files
✅ Complete documentation
✅ Docker ready
✅ CI/CD configured
✅ MIT Licensed
✅ Open for contributions

This is just the beginning

---

**Tweet 15/15:**
🧵 15/15

Shoutouts:

🙏 @solana team for building an incredible ecosystem
🙏 @SolaDex team for the opportunity to learn and build
🙏 @BinghamtonU for the CS foundation
🙏 Open source community for the tools and libraries

If you're interested in blockchain forensics, DeFi security, or just want to star the repo, check it out!

/END 🧵

---

**Standalone Tweet (Pinned):**

Built Pasha Tracker - a Solana transaction forensics platform

🔍 Trace crypto flows beyond surface-level explorers
🏦 Detect exchange wallets
👥 Identify coordinated wallet clusters
💵 Flag fiat off-ramps

CS @BinghamtonU | Building @SolaDex

Repo: github.com/HaroonPashaaa/pasha-tracker

#Solana #DeFi #Blockchain

---

**Notes for posting:**
- Post as a thread (reply to yourself)
- Add relevant images if possible (architecture diagram, code screenshots)
- Pin the standalone tweet to profile
- Tag @solana and @SolaDex in replies for visibility
- Use hashtags: #Solana #DeFi #Blockchain #OpenSource #Crypto
