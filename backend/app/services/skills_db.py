"""
skills_db.py
============
Canonical skill taxonomy for the SkillTrack AI resume engine.
Each entry has:
  - category: grouping label shown in the UI
  - surface_forms: alternate spellings / abbreviations the parser looks for
"""

SKILLS_DB = {
    # ── Languages ──────────────────────────────────────────────────────────
    "python":       {"category": "Languages", "surface_forms": ["python", "python3", "py"]},
    "javascript":   {"category": "Languages", "surface_forms": ["javascript", "js", "es6", "es2015", "esmodules", "esnext", "ecmascript"]},
    "typescript":   {"category": "Languages", "surface_forms": ["typescript", "ts"]},
    "java":         {"category": "Languages", "surface_forms": ["java"]},
    "c++":          {"category": "Languages", "surface_forms": ["c++", "cpp", "c plus plus"]},
    "c#":           {"category": "Languages", "surface_forms": ["c#", "csharp", "c sharp"]},
    "go":           {"category": "Languages", "surface_forms": ["golang", "go lang"]},
    "rust":         {"category": "Languages", "surface_forms": ["rust", "rust-lang"]},
    "php":          {"category": "Languages", "surface_forms": ["php"]},
    "ruby":         {"category": "Languages", "surface_forms": ["ruby", "ruby on rails"]},
    "swift":        {"category": "Languages", "surface_forms": ["swift"]},
    "kotlin":       {"category": "Languages", "surface_forms": ["kotlin"]},
    "scala":        {"category": "Languages", "surface_forms": ["scala"]},
    "r":            {"category": "Languages", "surface_forms": ["r programming", "r language", "rlang"]},
    "sql":          {"category": "Languages", "surface_forms": ["sql", "structured query language"]},
    "bash":         {"category": "Languages", "surface_forms": ["bash", "shell scripting", "sh", "zsh"]},
    "html":         {"category": "Languages", "surface_forms": ["html", "html5"]},
    "css":          {"category": "Languages", "surface_forms": ["css", "css3"]},
    "dart":         {"category": "Languages", "surface_forms": ["dart"]},

    # ── Frameworks & Libraries ─────────────────────────────────────────────
    "react":        {"category": "Frameworks", "surface_forms": ["react", "reactjs", "react.js", "react 19", "react18"]},
    "next.js":      {"category": "Frameworks", "surface_forms": ["next.js", "nextjs", "next js"]},
    "vue":          {"category": "Frameworks", "surface_forms": ["vue", "vuejs", "vue.js"]},
    "angular":      {"category": "Frameworks", "surface_forms": ["angular", "angularjs"]},
    "svelte":       {"category": "Frameworks", "surface_forms": ["svelte", "sveltekit"]},
    "node.js":      {"category": "Frameworks", "surface_forms": ["node.js", "nodejs", "node js"]},
    "express":      {"category": "Frameworks", "surface_forms": ["express", "express.js", "expressjs"]},
    "fastapi":      {"category": "Frameworks", "surface_forms": ["fastapi", "fast api"]},
    "django":       {"category": "Frameworks", "surface_forms": ["django"]},
    "flask":        {"category": "Frameworks", "surface_forms": ["flask"]},
    "spring boot":  {"category": "Frameworks", "surface_forms": ["spring boot", "springboot", "spring framework"]},
    "laravel":      {"category": "Frameworks", "surface_forms": ["laravel"]},
    "graphql":      {"category": "Frameworks", "surface_forms": ["graphql", "graph ql"]},
    "rest api":     {"category": "Frameworks", "surface_forms": ["rest api", "restful", "rest apis", "restful api"]},
    "flutter":      {"category": "Frameworks", "surface_forms": ["flutter"]},
    "react native": {"category": "Frameworks", "surface_forms": ["react native", "react-native"]},
    "vite":         {"category": "Frameworks", "surface_forms": ["vite", "vitejs"]},
    "pytorch":      {"category": "Frameworks", "surface_forms": ["pytorch", "torch"]},
    "tensorflow":   {"category": "Frameworks", "surface_forms": ["tensorflow", "tf"]},
    "scikit-learn": {"category": "Frameworks", "surface_forms": ["scikit-learn", "sklearn", "scikit learn"]},
    "pandas":       {"category": "Frameworks", "surface_forms": ["pandas"]},
    "numpy":        {"category": "Frameworks", "surface_forms": ["numpy"]},
    "langchain":    {"category": "Frameworks", "surface_forms": ["langchain", "lang chain"]},

    # ── Databases ──────────────────────────────────────────────────────────
    "postgresql":   {"category": "Databases", "surface_forms": ["postgresql", "postgres", "psql", "pg"]},
    "mysql":        {"category": "Databases", "surface_forms": ["mysql"]},
    "mongodb":      {"category": "Databases", "surface_forms": ["mongodb", "mongo"]},
    "redis":        {"category": "Databases", "surface_forms": ["redis"]},
    "elasticsearch":{"category": "Databases", "surface_forms": ["elasticsearch", "elastic search", "es"]},
    "dynamodb":     {"category": "Databases", "surface_forms": ["dynamodb", "dynamo db"]},
    "sqlite":       {"category": "Databases", "surface_forms": ["sqlite", "sqlite3"]},
    "supabase":     {"category": "Databases", "surface_forms": ["supabase"]},
    "firebase":     {"category": "Databases", "surface_forms": ["firebase", "firestore"]},
    "cassandra":    {"category": "Databases", "surface_forms": ["cassandra", "apache cassandra"]},
    "neo4j":        {"category": "Databases", "surface_forms": ["neo4j", "graph database"]},

    # ── Cloud & DevOps ─────────────────────────────────────────────────────
    "aws":          {"category": "Cloud & DevOps", "surface_forms": ["aws", "amazon web services", "ec2", "s3", "lambda", "ecs", "eks"]},
    "gcp":          {"category": "Cloud & DevOps", "surface_forms": ["gcp", "google cloud", "google cloud platform"]},
    "azure":        {"category": "Cloud & DevOps", "surface_forms": ["azure", "microsoft azure"]},
    "docker":       {"category": "Cloud & DevOps", "surface_forms": ["docker", "dockerfile", "docker-compose"]},
    "kubernetes":   {"category": "Cloud & DevOps", "surface_forms": ["kubernetes", "k8s", "kubectl", "helm"]},
    "terraform":    {"category": "Cloud & DevOps", "surface_forms": ["terraform", "iac", "infrastructure as code"]},
    "ci/cd":        {"category": "Cloud & DevOps", "surface_forms": ["ci/cd", "cicd", "continuous integration", "continuous deployment", "github actions", "gitlab ci", "jenkins", "circleci"]},
    "nginx":        {"category": "Cloud & DevOps", "surface_forms": ["nginx"]},
    "kafka":        {"category": "Cloud & DevOps", "surface_forms": ["kafka", "apache kafka"]},
    "rabbitmq":     {"category": "Cloud & DevOps", "surface_forms": ["rabbitmq", "rabbit mq"]},

    # ── Tools & Platforms ──────────────────────────────────────────────────
    "git":          {"category": "Tools & Platforms", "surface_forms": ["git", "github", "gitlab", "bitbucket"]},
    "linux":        {"category": "Tools & Platforms", "surface_forms": ["linux", "ubuntu", "debian", "centos"]},
    "jira":         {"category": "Tools & Platforms", "surface_forms": ["jira", "atlassian"]},
    "postman":      {"category": "Tools & Platforms", "surface_forms": ["postman", "insomnia"]},
    "figma":        {"category": "Tools & Platforms", "surface_forms": ["figma"]},
    "openai api":   {"category": "Tools & Platforms", "surface_forms": ["openai", "openai api", "chatgpt api", "gpt-4", "gpt4"]},
    "livekit":      {"category": "Tools & Platforms", "surface_forms": ["livekit", "webrtc"]},
    "stripe":       {"category": "Tools & Platforms", "surface_forms": ["stripe"]},
    "razorpay":     {"category": "Tools & Platforms", "surface_forms": ["razorpay"]},

    # ── Soft Skills ────────────────────────────────────────────────────────
    "communication":       {"category": "Soft Skills", "surface_forms": ["communication", "communication skills", "verbal communication", "written communication"]},
    "leadership":          {"category": "Soft Skills", "surface_forms": ["leadership", "team lead", "led a team", "managed a team"]},
    "problem solving":     {"category": "Soft Skills", "surface_forms": ["problem solving", "problem-solving", "analytical thinking", "critical thinking"]},
    "collaboration":       {"category": "Soft Skills", "surface_forms": ["collaboration", "teamwork", "cross-functional", "cross functional"]},
    "agile":               {"category": "Soft Skills", "surface_forms": ["agile", "scrum", "kanban", "sprint planning", "standup"]},
    "stakeholder mgmt":    {"category": "Soft Skills", "surface_forms": ["stakeholder", "stakeholder management", "client communication"]},
    "mentoring":           {"category": "Soft Skills", "surface_forms": ["mentoring", "mentorship", "coaching", "onboarding"]},
    "time management":     {"category": "Soft Skills", "surface_forms": ["time management", "prioritization", "deadline"]},
}

SOFT_SKILLS = {k for k, v in SKILLS_DB.items() if v["category"] == "Soft Skills"}

SKILL_SYNONYMS = {
    "js":         "javascript",
    "ts":         "typescript",
    "py":         "python",
    "k8s":        "kubernetes",
    "gh actions": "ci/cd",
    "postgres":   "postgresql",
    "mongo":      "mongodb",
    "tf":         "tensorflow",
    "sklearn":    "scikit-learn",
    "node":       "node.js",
    "express.js": "express",
    "next":       "next.js",
    "vue.js":     "vue",
    "rn":         "react native",
}


def all_categories():
    return sorted({v["category"] for v in SKILLS_DB.values()})
