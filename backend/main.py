import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is not set. Please add it to your .env file.")

os.environ["GROQ_API_KEY"] = GROQ_API_KEY
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"
os.environ["OPENAI_API_KEY"] = "sk-no-openai-not-used"  # dummy — CrewAI internal check only

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process, LLM

# ==========================================
# Groq LLM — faster model, lower temperature
# ==========================================
llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY,
    temperature=0.1,
    max_tokens=4096,
)

# ==========================================
# 2 Agents only (was 4) — reduces API calls by 50%, much faster
# Agent 1 does: extract + categorize + architecture + dependencies
# Agent 2 does: sprint planning + tech notes + project summary
# ==========================================

analyst_agent = Agent(
    role="Senior Business Analyst & Software Architect",
    goal=(
        "Extract every feature from messy requirements, categorize them by domain, "
        "identify ALL technical dependencies, recommend a tech stack, and flag risks."
    ),
    backstory=(
        "You have 15 years of experience as both a business analyst and software architect. "
        "You identify explicit AND implicit requirements. You know that auth must come before "
        "user profiles, databases before APIs, APIs before frontends, and integrations last. "
        "You never miss features even if mentioned casually. You are thorough and precise."
    ),
    llm=llm,
    verbose=False,
    allow_delegation=False,
)

agile_agent = Agent(
    role="Agile Coach, Scrum Master & Tech Lead",
    goal=(
        "Convert categorized features into detailed 2-week sprints. Each sprint must have "
        "20-35 story points, proper user stories, acceptance criteria, API endpoints, "
        "DB models, and a Definition of Done. No sprint overlap in timeline."
    ),
    backstory=(
        "You are a certified Scrum Master and senior tech lead with 12 years experience. "
        "Rules you follow strictly:\n"
        "1. Each sprint = exactly 2 weeks, numbered sequentially (Sprint 1: Weeks 1-2, Sprint 2: Weeks 3-4, etc.)\n"
        "2. Each sprint MUST have 20-35 story points total — never less\n"
        "3. Story point scale: 1=trivial, 2=simple, 3=moderate, 5=complex, 8=very complex, 13=epic\n"
        "4. User story format: 'As a [role], I want [feature] so that [benefit]'\n"
        "5. Every feature from the requirements MUST appear in some sprint\n"
        "6. Never repeat the same sprint timeline — each sprint occupies unique weeks\n"
        "7. Never split one feature into two separate sprints unnecessarily\n"
        "8. Payment integration belongs in ONE sprint, not two\n"
        "9. Always include API endpoints and DB models per sprint\n"
        "10. End with a Project Summary: total sprints, timeline, MVP definition, team size"
    ),
    llm=llm,
    verbose=False,
    allow_delegation=False,
)

# ==========================================
# FastAPI App
# ==========================================
app = FastAPI(title="AI Agile Planner", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RequirementRequest(BaseModel):
    text: str

class RequirementResponse(BaseModel):
    raw_features: str
    architecture_plan: str
    sprint_plan: str
    final_structured_plan: str
    categorized_list: str  # frontend compatibility


@app.post("/api/structure-requirements", response_model=RequirementResponse)
def process_requirements(request: RequirementRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Input text cannot be empty.")

    print(f"\n{'='*60}")
    print(f"Received: {request.text[:120]}...")
    print(f"{'='*60}")

    try:
        # ── Task 1: Full analysis + architecture ──────────────────
        task_analyze = Task(
            description=(
                f"Analyze these business requirements and produce a structured analysis.\n\n"
                f"INPUT:\n{request.text}\n\n"
                f"OUTPUT FORMAT (use exactly these sections):\n\n"
                f"## Extracted Features by Domain\n"
                f"Group ALL features under:\n"
                f"- Authentication & User Management\n"
                f"- Core Business Features\n"
                f"- UI/UX & Mobile\n"
                f"- Integrations & Payments (mention ALL payment methods like UPI, card etc.)\n"
                f"- Analytics & Reporting\n"
                f"- Nice-to-have / Optional\n\n"
                f"## Technical Dependencies\n"
                f"List as: '[Feature A] must be built before [Feature B] because [reason]'\n\n"
                f"## Recommended Tech Stack\n"
                f"Frontend, Backend, Database, Auth, Payment, Hosting\n\n"
                f"## Build Order (Phases)\n"
                f"Phase 1: Foundation → Phase 2: Core → Phase 3: Advanced → Phase 4: Polish\n\n"
                f"## Top 5 Technical Risks\n"
                f"Number them 1-5 with mitigation strategy for each."
            ),
            expected_output="Structured analysis with all 5 sections filled completely.",
            agent=analyst_agent,
        )

        # ── Task 2: Full sprint plan ───────────────────────────────
        task_sprint = Task(
            description=(
                "Using the analysis from the previous task, create a complete Agile Sprint Plan.\n\n"
                "STRICT RULES:\n"
                "- Sprint 1 = Weeks 1-2, Sprint 2 = Weeks 3-4, Sprint 3 = Weeks 5-6, and so on (NO overlap)\n"
                "- Each sprint MUST total 20-35 story points\n"
                "- Include EVERY feature from the analysis — nothing skipped\n"
                "- Combine related features into same sprint (e.g., card + UPI payment = one sprint)\n"
                "- User story format: 'As a [role], I want [feature] so that [benefit]'\n"
                "- Story points per story: 1, 2, 3, 5, 8, or 13 only\n\n"
                "FOR EACH SPRINT provide:\n"
                "### Sprint N: [Name] (Weeks X-Y)\n"
                "**Sprint Goal:** one sentence\n"
                "**Dependencies:** Sprint X (or None)\n\n"
                "**User Stories:**\n"
                "- Story: As a...\n"
                "  - Points: N\n"
                "  - Acceptance Criteria:\n"
                "    - criterion 1\n"
                "    - criterion 2\n"
                "    - criterion 3\n\n"
                "**Sprint Total: XX points**\n\n"
                "**API Endpoints:**\n"
                "- METHOD /path — description\n\n"
                "**Database Models:**\n"
                "- TableName: fields\n\n"
                "**Definition of Done:**\n"
                "- checklist item\n\n"
                "**Technical Risks:**\n"
                "- risk and mitigation\n\n"
                "---\n\n"
                "END WITH:\n"
                "## Project Summary\n"
                "- Total Sprints: N\n"
                "- Total Timeline: N weeks\n"
                "- Total Story Points: N\n"
                "- MVP (Sprints 1-N): which sprints form MVP\n"
                "- Post-MVP Features: list\n"
                "- Recommended Team: roles and count\n"
            ),
            expected_output=(
                "Complete sprint-by-sprint Agile plan in Markdown. "
                "Every sprint has 20-35 points, unique week ranges, and all sections filled."
            ),
            agent=agile_agent,
        )

        # ── Single crew, 2 tasks ───────────────────────────────────
        crew = Crew(
            agents=[analyst_agent, agile_agent],
            tasks=[task_analyze, task_sprint],
            process=Process.sequential,
            verbose=False,
        )

        result = crew.kickoff()

        # Extract outputs
        analysis_out = ""
        sprint_out = ""

        if hasattr(result, "tasks_output") and result.tasks_output:
            if len(result.tasks_output) >= 1:
                t0 = result.tasks_output[0]
                analysis_out = str(t0.raw if hasattr(t0, "raw") else t0).strip()
            if len(result.tasks_output) >= 2:
                t1 = result.tasks_output[1]
                sprint_out = str(t1.raw if hasattr(t1, "raw") else t1).strip()

        # Fallback
        if not sprint_out:
            sprint_out = str(result.raw if hasattr(result, "raw") else result).strip()

        if not sprint_out:
            raise HTTPException(status_code=500, detail="Pipeline returned empty output.")

        # Combine both into final full document
        final_doc = f"# Agile Project Plan\n\n{analysis_out}\n\n---\n\n{sprint_out}"

        print("Pipeline complete!")
        return RequirementResponse(
            raw_features=analysis_out,
            architecture_plan=analysis_out,
            sprint_plan=sprint_out,
            final_structured_plan=final_doc,
            categorized_list=analysis_out,
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI pipeline error: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Agile Planner v3 running."}

@app.get("/")
async def root():
    return {"app": "AI Agile Planner", "version": "3.0.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    print("Starting AI Agile Planner v3 on http://0.0.0.0:8000 ...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)