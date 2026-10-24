
const Model = {
  // GitHub profile and contact details
  githubUser: "Atiqxyz",
  contactEmail: "atiqongithubig@gmail.com",

  // Application state
  state: {
    screen: "home",
    menuIndex: 0,
    reposLoaded: false,
    skillsBuilt: false
  },

  // Featured projects, rendered independently of the GitHub API
  featured: [
    {
      title: "Orbital Decay Simulator",
      tag: "ORBITAL MECHANICS",
      color: "#7C9CFF",
      url: "https://github.com/Atiqxyz/Orbital-Decay-Simulation-code-v1",
      cta: "Explore project",
      img: "assets/projects/orbital-decay.png",
      desc: "A scientific simulation exploring orbital decay in low Earth orbit, including atmospheric drag and the influence of changing space-weather conditions on satellite orbital evolution."
    },
    {
      title: "N-Body Gravity Sandbox",
      tag: "COMPUTATIONAL PHYSICS",
      color: "#C29BFF",
      url: "https://github.com/Atiqxyz/N-body-gravity-sandbox",
      cta: "Explore project",
      img: "assets/projects/n-body.png",
      desc: "A gravity simulation sandbox for exploring interacting celestial bodies and complex gravitational systems through numerical modelling and multi-body dynamics."
    },
    {
      title: "Cellular Automaton",
      tag: "COMPLEX SYSTEMS",
      color: "#73E0D1",
      url: "https://github.com/Atiqxyz/Cellular-Automaton",
      cta: "Explore project",
      img: "assets/projects/cellular-automaton.png",
      desc: "An exploration of cellular automata, evolving patterns, and emergent behaviour. Investigates how local state-transition rules can create complex system-wide patterns."
    },
    {
      title: "LLM Stack Bundle",
      tag: "TECHNICAL REFERENCE",
      color: "#FFB77A",
      url: "https://github.com/Abdullah6926/LLM-Stack-Report-Bundle-.",
      cta: "Explore the bundle",
      img: "assets/projects/llm-stack.png",
      desc: "A technical guide and resource bundle covering cloud and self-hosted language models, Ollama, the Model Context Protocol (MCP), and agent architectures."
    }
  ],

  // Featured repositories excluded from the live repository results
  featuredRepoNames: [
    "Orbital-Decay-Simulation-code-v1",
    "N-body-gravity-sandbox",
    "Cellular-Automaton"
  ],

  // Local fallback cards for the All Repositories section
  fallbackRepos: [
    {
      name: "Orbital-Decay-Simulation-code-v1",
      language: "Python",
      stargazers_count: 0,
      html_url: "https://github.com/Atiqxyz/Orbital-Decay-Simulation-code-v1",
      description: "A simulation exploring orbital decay in low Earth orbit."
    },
    {
      name: "N-body-gravity-sandbox",
      language: "JavaScript",
      stargazers_count: 0,
      html_url: "https://github.com/Atiqxyz/N-body-gravity-sandbox",
      description: "Explore gravitational interactions and multi-body dynamics."
    },
    {
      name: "Cellular-Automaton",
      language: "JavaScript",
      stargazers_count: 0,
      html_url: "https://github.com/Atiqxyz/Cellular-Automaton",
      description: "Explore evolving patterns and emergent behaviour through cellular automata."
    }
  ],

  // Optional repository image overrides
  projectImages: {},

  // Language colors for repository cards
  langColors: {
    JavaScript: "#F1E05A",
    TypeScript: "#3178C6",
    Python: "#3572A5",
    HTML: "#E34C26",
    CSS: "#563D7C",
    Java: "#B07219",
    "C++": "#F34B7D",
    C: "#555555",
    "C#": "#178600",
    Go: "#00ADD8",
    Rust: "#DEA584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#F05138",
    Kotlin: "#A97BFF",
    Shell: "#89E051",
    Jupyter: "#DA5B0B",
    MATLAB: "#E16737",
    Lua: "#000080",
    Dart: "#00B4AB",
    Vue: "#41B883",
    Svelte: "#FF3E00"
  },

  // Skills using the original rating-bar structure.
  // Adjust these illustrative estimates to your own self-assessment.
  skills: [
    {
      group: "Physics & Space",
      items: [
        ["Physics", 90],
        ["Orbital mechanics", 85],
        ["Gravitational systems", 85],
        ["Numerical simulation", 85]
      ]
    },
    {
      group: "Scientific Work",
      items: [
        ["Scientific research", 80],
        ["Scientific modelling", 85],
        ["Chemistry", 80]
      ]
    },
    {
      group: "Technical Skills",
      items: [
        ["Scripting", 85],
        ["Computational problem-solving", 85],
        ["Technical documentation", 90]
      ]
    }
  ],

  // Fetch GitHub repositories, with a reliable local fallback.
  async fetchRepos() {
    const fallback = () =>
      this.fallbackRepos.map(repo => ({ ...repo }));

    try {
      const response = await fetch(
        `https://api.github.com/users/${this.githubUser}/repos?per_page=100&sort=updated`
      );

      if (!response.ok) {
        throw new Error(`GitHub API returned HTTP ${response.status}`);
      }

      const repos = await response.json();

      if (!Array.isArray(repos)) {
        throw new Error("Unexpected GitHub API response");
      }

      const filteredRepos = repos.sort((a, b) =>
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime()
        );

      this.state.reposLoaded = true;

      // Never leave the additional repository grid empty
      // when local fallback data is available.
      return filteredRepos.length > 0
        ? filteredRepos
        : fallback();

    } catch (error) {
      console.warn(
        "GitHub API unavailable. Showing local repositories instead.",
        error
      );

      this.state.reposLoaded = true;
      return fallback();
    }
  }
};
