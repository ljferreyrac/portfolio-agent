BACKGROUND = """
# Leonardo Ferreyra Canaval — Professional Profile

## Contact
- Location: Lima, Peru
- Phone: +51 934 169 751
- Email: lferreyrac04@hotmail.com

## Professional Summary
Software Engineer with 4+ years of experience designing scalable backend systems, AI-driven architecture, and cloud-native solutions. Specializes in Java/Spring Boot, Python, RESTful APIs, and distributed systems, with deep expertise in AI agent frameworks (CrewAI, LangGraph), LLM observability (Phoenix/Arize), and MCP-based automation.

At Kinara Systems, owned end-to-end design and delivery of multi-agent AI pipelines for real-time network analytics — integrating self-hosted and cloud LLMs, building LLM proxy infrastructure, and driving traceability with Phoenix. At Enviame, improved system reliability through Redis-based batching and automated developer workflows via MCP integrations with JIRA, Confluence, and Bitbucket.

Passionate about building intelligent, observable, and production-ready AI systems.

## Work Experience

### Software Developer | Kinara Systems | Canada (Remote) | Nov 2025 – Present
- Owned end-to-end design and delivery of a multi-agent AI pipeline for real-time Wi-Fi network analytics, leveraging CrewAI and LangGraph to orchestrate specialized agents for telemetry analysis, log classification, ping-pong detection, and sticky-client diagnosis.
- Architected and implemented an LLM proxy layer supporting dynamic routing between self-hosted models (Qwen, DeepSeek, ZGLM) and cloud providers (OpenAI, Anthropic), enabling seamless model swapping and A/B evaluation across the system.
- Integrated Phoenix (Arize) for end-to-end LLM observability and tracing — capturing MCPClient calls, CrewAI agent sessions, and tool-call execution to identify latency bottlenecks, hallucination patterns, and model inconsistencies across providers.
- Designed and owned the Streaming Telemetry Analyzer and Streaming Log Analyzer — Python backends consuming MQTT-based network data, applying LLM-driven classification, and exposing runtime-configurable APIs for dynamic threshold and pattern updates without service restarts.
- Built configuration management APIs with YAML-based persistence, enabling runtime updates to LLM parameters, alert thresholds, and monitoring patterns — validated via full integration test suites.
- Evaluated and benchmarked multiple LLMs (GPT-4o, GPT-OSS-120B, DeepSeek V3, Qwen3 235B, ZGLM 4.6) on real network queries, documenting tool-call behavior, latency profiles, and output quality to drive model selection decisions.
- Implemented a TTS (Text-to-Speech) proxy integration across both analyzers, including environment variable propagation, header handling, license-gated activation, and metrics formatting.
- Developed scale-testing infrastructure using InfluxDB and Mosquitto (Docker), generating synthetic datasets of up to 100 APs with dummy client telemetry to stress-test agent pipelines and validate detection logic under load.
- Built the sauble-microagents configuration module and refactored the service to consume client state from the telemetry service, decoupling detector responsibilities and improving system maintainability.
- Led license enforcement implementation across the AI pipeline — integrating claim-token validation, license-gated service termination, and end-to-end testing against deployed license APIs.
- Collaborated with cross-functional teams via Confluence documentation, Jira sprint planning, and code reviews — delivering production-grade deployments with thorough regression testing and root-cause analysis workflows.

### Software Developer | Enviame | Chile (Remote) | Apr 2025 – Nov 2025
- Led end-to-end implementation of backend features on Google Cloud (Cloud Run, Cloud Functions, Firestore, Cloud Storage), owning architecture decisions and delivery.
- Designed and optimized MySQL data access patterns, resolving critical performance issues caused by inconsistent data types and inefficient queries, resulting in significantly faster response times.
- Improved system reliability by implementing a Redis-based batching system to regulate outbound requests, reducing rate-limit errors (HTTP 429) and stabilizing external API communication.
- Owned the automation of the internal developer workflow by integrating MCP with JIRA, Confluence, and Bitbucket — including API configuration, workflow orchestration, and automatic PR generation, reducing manual work and improving team productivity.
- Built and maintained backend services using Python (Flask), focusing on clean architecture, maintainability, and performance.

### Software Developer | CIVA | Lima, Peru | Apr 2024 – Apr 2025
- Developed backend for the FLIT transportation ERP using Java/Spring Boot, implementing JWT authentication and RESTful APIs.
- Optimized response times by implementing Data Transfer Objects (DTOs), achieving a 30% reduction in latency.
- Migrated from basic authentication to JWT with Spring Boot Security, enabling integration with Microsoft Azure SSO.
- Developed frontend components with React/Redux following Domain-Driven Design principles within Agile/Scrum workflows.

### Software Developer | SOLYMAN Consultores de TI | Lima, Peru (Remote) | Sep 2023 – Feb 2024
- Developed a currency and cryptocurrency exchange platform in Odoo using MVC and OOP with real-time REST API integrations.
- Implemented dynamic JavaScript visualizations for trend analysis and a PostgreSQL-backed reporting module for SBS.

### Software Engineer | VALENTOR Producciones S.A.C. | Lima, Peru (Remote) | Apr 2022 – Sep 2023
- Architected and delivered 5+ integrated systems for nightclub operations:
  - Personnel management system: Django + React/TypeScript deployed on AWS
  - Cross-platform mobile app: Flutter + NestJS
  - POS system: Next.js + Spring Boot
  - Attendance control with facial recognition: Vue.js + .NET + Azure AD
  - Event marketing platform: Angular + Express.js + Python/Pandas
- Implemented cloud infrastructure on AWS and GCP with CI/CD, Docker, and Kubernetes — improving deployment speed by 60% and reducing downtime significantly.

## Education

### B.Sc. Software Engineering | Universidad Peruana de Ciencias Aplicadas (UPC) | Lima, Peru
- Expected graduation: June 2026
- GPA: 17.70/20 — consistently ranked top 5 students from 1st through 9th semester
- Notable academic projects: Full-stack Angular + Spring Boot (open source); Vue.js + .NET web application

### English Language Studies (B2 TOEFL) | Instituto Cultural Peruano Norteamericano | Lima, Peru | 2022

## Technical Skills

- **AI & Agents:** CrewAI, LangGraph, MCP (Model Context Protocol), RAG Pipelines, LLM Orchestration, Phoenix/Arize (LLM Tracing & Observability), prompt engineering, LLM benchmarking
- **Backend:** Java/Spring Boot, Python (Flask, Django, FastAPI), Node.js (NestJS, Express), RESTful APIs, JWT Auth, Redis, MQTT, clean architecture, DDD
- **Frontend:** React/Redux, Angular, Vue.js, Next.js, Flutter, TypeScript
- **Cloud & DevOps:** GCP (Cloud Run, Cloud Functions, Firestore, Cloud Storage), AWS (EC2, S3), Docker, Kubernetes, CI/CD, Bitbucket Pipelines
- **Databases:** MySQL, PostgreSQL, InfluxDB, Firestore, Redis
- **Methodologies:** Domain-Driven Design (DDD), MVC, OOP, Agile/Scrum, Clean Architecture

## Languages
- Spanish: Native
- English: Professional Working (B2 TOEFL)

## Certifications
- Generative AI Fundamentals Specialization — IBM (2025)
- AI Agents — Platzi (2025)
- NestJS — DevTalles (2025)
- Next.js — DevTalles (2025)
- Full Stack MERN Development — Udemy (2024)
- Node.js — DevTalles (2024)
- Microsoft Azure — Microsoft (2023)
"""
