
/* =====================================================================
   CONTROLLER — navigation, projects, skills, contact form and audio.
   ===================================================================== */

const Controller = {
  transitioning: false,
  audioUnlocked: false,

  init() {
    View.init();
    this.bindMenu();
    this.bindKeyboard();
    this.bindAudioUnlock();
    this.bindContactForm();
    this.bindBackgroundMusic();
  },

  /* ---------- Contact form ---------- */
  bindContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const status = document.getElementById("form-status");
    const btn = form.querySelector(".form-send");

    form.addEventListener("submit", async e => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());

      if (data._honey) return;

      if (
        !data.name?.trim() ||
        !data.email?.trim() ||
        !data.message?.trim()
      ) {
        if (status) status.textContent = "Fill in all three fields first.";
        return;
      }

      if (btn) btn.disabled = true;
      if (status) status.textContent = "Sending…";

      try {
        const res = await fetch(
          `https://formsubmit.co/ajax/${Model.contactEmail}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              name: data.name,
              email: data.email,
              message: data.message,
              _subject: `Portfolio message from ${data.name}`
            })
          }
        );

        if (!res.ok) throw new Error(`Form submission failed: ${res.status}`);

        const result = await res.json();

        if (result.success === "false") {
          throw new Error("The form service rejected the message.");
        }

        if (status) status.textContent = "Sent! I'll get back to you soon.";
        form.reset();
        this.play();
      } catch (error) {
        console.error("Contact form submission failed:", error);

        if (status) {
          status.textContent = "Opening your email app instead…";
        }

        const subject = encodeURIComponent(
          `Portfolio message from ${data.name}`
        );
        const body = encodeURIComponent(
          `${data.message}\n\nReply to: ${data.email}`
        );

        location.href =
          `mailto:${Model.contactEmail}?subject=${subject}&body=${body}`;
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  },

  /* ---------- Navigation ---------- */
  goTo(screen) {
    if (this.transitioning || screen === Model.state.screen) return;

    this.transitioning = true;
    this.play();

    View.wipe(
      () => {
        Model.state.screen = screen;
        View.showScreen(screen);

        if (screen === "projects") this.loadProjects();
        if (screen === "skills") this.loadSkills();
      },
      () => {
        this.transitioning = false;
      }
    );
  },

  select(index) {
    const n = View.els.menuItems.length;
    const next = (index + n) % n;

    if (next !== Model.state.menuIndex) this.play();

    Model.state.menuIndex = next;
    View.setMenuSelection(next);
  },

  /* ---------- Projects ---------- */
  async loadProjects() {
    View.renderFeatured(Model.featured);

    if (Model.state.reposLoaded) return;

    try {
      const repos = await Model.fetchRepos();
      const safeRepos = Array.isArray(repos) ? repos : [];

      View.renderRepos(
        safeRepos,
        safeRepos.length
          ? `Showing ${safeRepos.length} repositories`
          : "No additional repositories to display.",
        Model
      );
    } catch (error) {
      console.error("Project loading failed:", error);

      const fallback = Array.isArray(Model.fallbackRepos)
        ? Model.fallbackRepos
        : [];

      View.renderRepos(fallback, "Showing locally saved repositories.", Model);
    } finally {
      Model.state.reposLoaded = true;
    }
  },

  /* ---------- Skills ---------- */
  loadSkills() {
    if (!Model.state.skillsBuilt) {
      View.renderSkills(Model.skills);
      Model.state.skillsBuilt = true;
    }

    View.animateSkillBars();
  },

  /* ---------- Navigation sound effects ---------- */
  play() {
    if (this.audioUnlocked) View.playSelect();
  },

  bindAudioUnlock() {
    const unlock = () => {
      this.audioUnlocked = true;
    };

    addEventListener("pointerdown", unlock, {
      once: true,
      capture: true
    });

    addEventListener("keydown", unlock, {
      once: true,
      capture: true
    });
  },

  /* ---------- Background music ---------- */
  bindBackgroundMusic() {
    const music = document.getElementById("bg-music");
    const toggle = document.getElementById("music-toggle");

    if (!music) {
      console.error("Background music element #bg-music was not found.");
      return;
    }

    music.volume = 0.35;
    music.loop = true;

    const updateButton = () => {
      if (!toggle) return;

      const playing = !music.paused && !music.ended;

      toggle.textContent = playing ? "♫ MUSIC: ON" : "♫ MUSIC: OFF";
      toggle.setAttribute(
        "aria-label",
        playing ? "Pause background music" : "Play background music"
      );
      toggle.setAttribute("aria-pressed", String(playing));
    };

    /* Start from the beginning whenever playback is requested. */
    const startMusic = async () => {
      if (!music.paused) return;

      try {
        music.currentTime = 0;
        await music.play();
        updateButton();
        console.log("Background music started from 0:00.");
      } catch (error) {
        console.warn("Background music could not start:", error);
        updateButton();
      }
    };

    /* Optional manual toggle. */
    if (toggle) {
      toggle.addEventListener("click", async () => {
        if (!music.paused) {
          music.pause();
          updateButton();
        } else {
          await startMusic();
        }
      });
    }

    music.addEventListener("play", updateButton);
    music.addEventListener("pause", updateButton);
    music.addEventListener("ended", updateButton);

    music.addEventListener("error", () => {
      console.error("Audio loading error:", music.error?.code);
      if (toggle) toggle.textContent = "♫ MUSIC ERROR";
    });

    updateButton();

    /*
     * AUTOPLAY:
     * Attempt playback as soon as the portfolio opens.
     * If the browser blocks autoplay, retry on the visitor's first
     * interaction. Browsers may still require an explicit interaction.
     */
    music.currentTime = 0;

    music.play()
      .then(() => {
        updateButton();
        console.log("Background music autoplay started.");
      })
      .catch(error => {
        console.warn("Autoplay blocked; waiting for first interaction.", error);

        let started = false;

        const retryAutoplay = () => {
          if (started) return;
          started = true;

          document.removeEventListener("pointerdown", retryAutoplay);
          document.removeEventListener("keydown", retryAutoplay);

          startMusic();
        };

        document.addEventListener("pointerdown", retryAutoplay);
        document.addEventListener("keydown", retryAutoplay);
      });
  },

  /* ---------- Menu bindings ---------- */
  bindMenu() {
    View.els.menuItems.forEach((item, i) => {
      item.addEventListener("mouseenter", () => this.select(i));

      item.addEventListener("click", () => {
        this.goTo(item.dataset.target);
      });
    });

    document.querySelectorAll("[data-back]").forEach(button => {
      button.addEventListener("click", () => this.goTo("home"));
    });

    const bigName = document.getElementById("big-name");

    if (bigName) {
      bigName.addEventListener("click", () => {
        if (Model.state.screen !== "home") {
          this.goTo("home");
        } else {
          this.play();
        }
      });
    }
  },

  /* ---------- Keyboard controls ---------- */
  bindKeyboard() {
    addEventListener("keydown", e => {
      if (Model.state.screen === "home") {
        if (e.key === "ArrowDown") {
          this.select(Model.state.menuIndex + 1);
          e.preventDefault();
        } else if (e.key === "ArrowUp") {
          this.select(Model.state.menuIndex - 1);
          e.preventDefault();
        } else if (e.key === "Enter") {
          const item = View.els.menuItems[Model.state.menuIndex];
          if (item) this.goTo(item.dataset.target);
        }
      } else if (e.key === "Escape") {
        this.goTo("home");
      }
    });
  }
};

Controller.init();
