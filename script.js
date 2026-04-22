    document.addEventListener("DOMContentLoaded", () => {
      console.log("[AutomateX] DOMContentLoaded fired");

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const topLoader = document.getElementById("topLoader");
      const speechBubble = document.getElementById("speechBubble");
      const mascot = document.getElementById("mascot");
      const toggleToy = document.getElementById("toggleToy");
      const typingText = document.getElementById("typingText");
      const visitCounter = document.getElementById("visitCounter");
      const streakCounter = document.getElementById("streakCounter");
      const moodCounter = document.getElementById("moodCounter");
      const dailyMessageBadge = document.getElementById("dailyMessageBadge");
      const confettiLayer = document.getElementById("confettiLayer");
      const storyCards = Array.from(document.querySelectorAll(".story-card"));
      const storyButtons = Array.from(document.querySelectorAll("[data-story-target]"));
      const storyStage = document.getElementById("storyStage");
      const storyParallax = document.getElementById("storyParallax");
      const sections = Array.from(document.querySelectorAll("[data-section]"));
      const copyButtons = Array.from(document.querySelectorAll(".copy-button"));
      const tiltCards = Array.from(document.querySelectorAll(".card-hover"));
      const body = document.body;
      const topbar = document.querySelector(".topbar");
      const topbarInner = document.querySelector(".topbar-inner");
      const topnav = document.querySelector(".topnav");

      const mascotLines = {
        hero: [
          "Hello friend! I'm AXI, your animation buddy.",
          "This playground is ready. No blank zones, just fun things to explore.",
          "Try hovering on the toys and cards. They love attention."
        ],
        showcase: [
          "These are reusable animation toys. You can borrow them for other websites.",
          "Every card has a visible preview first and extra motion second.",
          "Tap Copy Code if one of these effects feels right for your next page."
        ],
        toys: [
          "Buttons, toggles, and emoji toys make interfaces feel friendly.",
          "Toy UI works best when it is playful and easy to understand.",
          "Even the loaders here are trying to make waiting less boring."
        ],
        story: [
          "We're in story mode now. Scroll and watch the mood change.",
          "This chapter is about curiosity, play, and imagination.",
          "The background shifts gently so the page always feels alive."
        ],
        visuals: [
          "The 3D section uses light floating shapes, not heavy effects.",
          "If a library fails, the fallback toys still keep this section full.",
          "That's how we avoid blank sections and surprise users in a good way."
        ],
        footer: [
          "You made it to the end. Come back tomorrow for a new message.",
          "Thanks for playing in the animation playground with me.",
          "Click me five times any time if you want a hidden celebration."
        ]
      };

      const dailyMessages = [
        "Today's smile: let motion teach before it dazzles.",
        "Today's smile: one playful detail can make a whole screen feel magical.",
        "Today's smile: rounded shapes and soft glows feel friendly fast.",
        "Today's smile: repeat visits deserve tiny surprises.",
        "Today's smile: animation works best when every state still feels clear."
      ];

      const heroMoods = [
        {
          name: "Sunny",
          background:
            "radial-gradient(circle at 10% 10%, rgba(79, 225, 255, 0.18), transparent 24%), radial-gradient(circle at 88% 14%, rgba(126, 109, 255, 0.22), transparent 28%), radial-gradient(circle at 48% 0%, rgba(101, 255, 185, 0.08), transparent 22%), linear-gradient(180deg, #091020 0%, #10173b 46%, #0a1022 100%)"
        },
        {
          name: "Candy",
          background:
            "radial-gradient(circle at 12% 12%, rgba(255, 216, 94, 0.16), transparent 22%), radial-gradient(circle at 84% 16%, rgba(79, 225, 255, 0.18), transparent 26%), radial-gradient(circle at 50% 0%, rgba(255, 129, 185, 0.12), transparent 22%), linear-gradient(180deg, #111733 0%, #1a1650 46%, #0b1126 100%)"
        },
        {
          name: "Dreamy",
          background:
            "radial-gradient(circle at 10% 10%, rgba(101, 255, 185, 0.15), transparent 24%), radial-gradient(circle at 88% 14%, rgba(126, 109, 255, 0.22), transparent 28%), radial-gradient(circle at 48% 0%, rgba(79, 225, 255, 0.12), transparent 22%), linear-gradient(180deg, #0a1224 0%, #18234a 46%, #091020 100%)"
        }
      ];

      const typingLines = [
        "AXI: Motion playground awake. Every section is visible and ready to play.",
        "AXI: Fallback systems loaded. If fancy effects fail, friendly visuals stay on screen.",
        "AXI: Three.js, GSAP, and Lottie are optional helpers, not single points of failure."
      ];

      function safeParse(value, fallback) {
        try {
          return JSON.parse(value) ?? fallback;
        } catch (error) {
          return fallback;
        }
      }

      function getDayKey(date = new Date()) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().slice(0, 10);
      }

      function updateVisitMemory() {
        const today = getDayKey();
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = getDayKey(yesterdayDate);

        const current = safeParse(localStorage.getItem("automatex-play-memory"), {
          visits: 0,
          streak: 0,
          dailyIndex: -1,
          lastVisit: null
        });

        if (current.lastVisit !== today) {
          current.visits += 1;
          current.streak = current.lastVisit === yesterday ? current.streak + 1 : 1;
          current.dailyIndex = (current.dailyIndex + 1) % dailyMessages.length;
          current.lastVisit = today;
          localStorage.setItem("automatex-play-memory", JSON.stringify(current));
        }

        visitCounter.textContent = String(current.visits).padStart(2, "0");
        streakCounter.textContent = `${current.streak} day${current.streak === 1 ? "" : "s"}`;
        dailyMessageBadge.textContent = dailyMessages[current.dailyIndex < 0 ? 0 : current.dailyIndex];
        return current;
      }

      function applyMood(memory) {
        const mood = heroMoods[(memory.visits + memory.streak + new Date().getDate()) % heroMoods.length];
        document.documentElement.style.setProperty("--hero-bg", mood.background);
        moodCounter.textContent = mood.name;
        console.log("[AutomateX] Applied mood:", mood.name);
      }

      function hideLoaderSoon() {
        window.setTimeout(() => {
          topLoader.classList.remove("visible");
        }, 700);
      }

      function showSpeech(message, timeout = 2600) {
        if (!speechBubble) return;
        speechBubble.textContent = message;
        speechBubble.style.opacity = "1";
        speechBubble.style.transform = "translateY(0) scale(1)";
        window.clearTimeout(showSpeech.timer);
        showSpeech.timer = window.setTimeout(() => {
          speechBubble.style.opacity = "0.92";
        }, timeout);
      }

      function copySnippet(text, button) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          console.log("[AutomateX] Clipboard unavailable");
          button.textContent = "Copy unavailable";
          window.setTimeout(() => {
            button.textContent = "Copy Code";
          }, 1400);
          return;
        }

        navigator.clipboard.writeText(text)
          .then(() => {
            button.textContent = "Copied";
            showSpeech("Snippet copied. You can paste it into another project now.", 1700);
            window.setTimeout(() => {
              button.textContent = "Copy Code";
            }, 1200);
          })
          .catch((error) => {
            console.log("[AutomateX] Clipboard error:", error);
            button.textContent = "Copy failed";
            window.setTimeout(() => {
              button.textContent = "Copy Code";
            }, 1200);
          });
      }

      function launchConfetti() {
        const colors = ["#4fe1ff", "#7e6dff", "#65ffb9", "#ffd85e", "#ff84bd"];
        for (let index = 0; index < 24; index += 1) {
          const piece = document.createElement("span");
          piece.className = "confetti";
          piece.style.left = `${Math.random() * 100}%`;
          piece.style.background = colors[index % colors.length];
          piece.style.animationDelay = `${Math.random() * 0.35}s`;
          confettiLayer.appendChild(piece);
          window.setTimeout(() => piece.remove(), 2800);
        }
      }

      function initCopyButtons() {
        copyButtons.forEach((button) => {
          button.addEventListener("click", () => copySnippet(button.dataset.copy || "", button));
        });
      }

      function initToggleToy() {
        if (!toggleToy) return;
        toggleToy.addEventListener("click", () => {
          toggleToy.classList.toggle("active");
          showSpeech(toggleToy.classList.contains("active") ? "Toy mode switched on!" : "Toy mode switched off!", 1500);
        });
      }

      function initTypingConsole() {
        if (!typingText) return;
        let lineIndex = 0;
        const writeLine = () => {
          const text = typingLines[lineIndex % typingLines.length];
          let charIndex = 0;
          typingText.textContent = "";
          window.clearInterval(writeLine.timer);
          writeLine.timer = window.setInterval(() => {
            typingText.textContent = text.slice(0, charIndex);
            charIndex += 1;
            if (charIndex > text.length) {
              window.clearInterval(writeLine.timer);
            }
          }, prefersReducedMotion ? 0 : 22);
          lineIndex += 1;
        };
        writeLine();
        window.setInterval(writeLine, prefersReducedMotion ? 6000 : 5200);
      }

      function initTiltCards() {
        if (prefersReducedMotion) return;
        tiltCards.forEach((card) => {
          card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            const rotateY = (px - 0.5) * 9;
            const rotateX = (0.5 - py) * 8;
            card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
          });
          card.addEventListener("pointerleave", () => {
            card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
          });
        });
      }

      function initMascot() {
        if (!mascot) return;

        const leftEye = document.querySelector(".eye-left");
        const rightEye = document.querySelector(".eye-right");
        const antenna = document.querySelector(".mascot-antenna");
        const leftArm = document.querySelector(".mascot-arm.left");
        const rightArm = document.querySelector(".mascot-arm.right");
        const shell = document.querySelector(".mascot-shell");
        let clickCount = 0;

        const triggerClick = () => {
          clickCount += 1;
          const clickLines = [
            "Boop! That tickles my antenna.",
            "You found my happy bounce button.",
            "I think we are becoming scroll buddies.",
            "One more tap after this and something silly may happen.",
            "Secret party mode unlocked!"
          ];
          showSpeech(clickLines[Math.min(clickCount - 1, clickLines.length - 1)], 1700);

          if (window.gsap && !prefersReducedMotion) {
            window.gsap.fromTo(
              mascot,
              { rotate: -4, scale: 0.98 },
              { rotate: 4, scale: 1.04, duration: 0.16, yoyo: true, repeat: 1, ease: "power1.inOut" }
            );
          }

          if (clickCount >= 5) {
            clickCount = 0;
            launchConfetti();
            document.body.animate(
              [
                { filter: "hue-rotate(0deg) saturate(1)" },
                { filter: "hue-rotate(90deg) saturate(1.4)" },
                { filter: "hue-rotate(0deg) saturate(1)" }
              ],
              { duration: 1600, easing: "ease-in-out" }
            );
            showSpeech("Surprise party mode! You found the confetti easter egg.", 2400);
          }
        };

        mascot.addEventListener("click", triggerClick);
        mascot.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            triggerClick();
          }
        });

        mascot.addEventListener("pointerenter", () => {
          showSpeech("Hi! Hovering makes me extra happy.", 1400);
        });

        if (window.gsap && !prefersReducedMotion) {
          console.log("[AutomateX] GSAP mascot animation enabled");
          window.gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } })
            .to(mascot, { y: -10, duration: 1.7 })
            .to(mascot, { y: 0, duration: 1.7 });

          window.gsap.timeline({ repeat: -1, repeatDelay: 2.1 })
            .to([leftEye, rightEye], { scaleY: 0.08, duration: 0.08, transformOrigin: "center center" })
            .to([leftEye, rightEye], { scaleY: 1, duration: 0.14 });

          window.gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } })
            .to(antenna, { rotate: 8, duration: 1.2 })
            .to(antenna, { rotate: -8, duration: 1.2 })
            .to(antenna, { rotate: 0, duration: 1.2 });

          window.gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } })
            .to(shell, { scaleY: 1.02, duration: 1.5 })
            .to(shell, { scaleY: 0.99, duration: 1.5 });

          window.gsap.to(leftArm, { rotate: 10, repeat: -1, yoyo: true, duration: 1.6, ease: "sine.inOut" });
          window.gsap.to(rightArm, { rotate: -10, repeat: -1, yoyo: true, duration: 1.6, ease: "sine.inOut" });
        } else {
          console.log("[AutomateX] GSAP unavailable, mascot using CSS/static fallback");
        }
      }

      function initSectionGuide() {
        const seen = new Map();
        sections.forEach((section) => seen.set(section.dataset.section, 0));

        const sectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const key = entry.target.dataset.section;
            const group = mascotLines[key];
            if (!group || !group.length) return;
            const messageIndex = seen.get(key) || 0;
            showSpeech(group[messageIndex % group.length], 1800);
            seen.set(key, messageIndex + 1);
          });
        }, { threshold: 0.48 });

        sections.forEach((section) => sectionObserver.observe(section));
      }

      function activateStoryCard(id) {
        const palettes = [
          "linear-gradient(180deg, rgba(10, 16, 36, 0.96), rgba(11, 18, 40, 0.8))",
          "linear-gradient(180deg, rgba(26, 17, 52, 0.96), rgba(12, 16, 38, 0.8))",
          "linear-gradient(180deg, rgba(12, 24, 38, 0.96), rgba(13, 18, 40, 0.8))"
        ];

        storyCards.forEach((card, index) => {
          const active = card.id === id;
          card.classList.toggle("active", active);
          if (active) {
            storyStage.style.background = palettes[index];
            showSpeech(card.dataset.mascot || "Story mode active.", 1700);
          }
        });
      }

      function initStory() {
        storyButtons.forEach((button) => {
          button.addEventListener("click", () => {
            const target = document.getElementById(button.dataset.storyTarget);
            if (!target) return;
            target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "center" });
            activateStoryCard(target.id);
          });
        });

        const storyObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              activateStoryCard(entry.target.id);
            }
          });
        }, { threshold: 0.56 });

        storyCards.forEach((card) => storyObserver.observe(card));

        if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
          console.log("[AutomateX] ScrollTrigger story animation enabled");
          window.gsap.registerPlugin(window.ScrollTrigger);

          window.gsap.to(".story-circle.one", { rotation: 360, duration: 18, repeat: -1, ease: "none" });
          window.gsap.to(".story-circle.two", { rotation: -360, duration: 14, repeat: -1, ease: "none" });
          window.gsap.to(".story-circle.three", { rotation: 360, duration: 10, repeat: -1, ease: "none" });
          window.gsap.to(".story-core", { scale: 1.08, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });

          window.gsap.to(storyParallax, {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
              trigger: "#story",
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          });

          document.querySelectorAll(".reveal").forEach((node) => {
            window.gsap.from(node, {
              y: 22,
              opacity: 0,
              duration: 0.75,
              ease: "power2.out",
              scrollTrigger: {
                trigger: node,
                start: "top 88%"
              }
            });
          });
        } else {
          console.log("[AutomateX] ScrollTrigger unavailable, story stays fully visible");
        }
      }

      function initNetworkCanvas() {
        const canvas = document.getElementById("networkCanvas");
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) {
          console.log("[AutomateX] Network canvas context unavailable");
          return;
        }

        const points = [];
        const pointCount = prefersReducedMotion || window.innerWidth < 768 ? 16 : 28;

        function resizeCanvas() {
          const bounds = canvas.parentElement.getBoundingClientRect();
          canvas.width = bounds.width * window.devicePixelRatio;
          canvas.height = bounds.height * window.devicePixelRatio;
          canvas.style.width = `${bounds.width}px`;
          canvas.style.height = `${bounds.height}px`;
          context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
        }

        function seedPoints() {
          points.length = 0;
          for (let index = 0; index < pointCount; index += 1) {
            points.push({
              x: Math.random() * canvas.clientWidth,
              y: Math.random() * canvas.clientHeight,
              vx: (Math.random() - 0.5) * 0.35,
              vy: (Math.random() - 0.5) * 0.35,
              r: Math.random() * 2 + 1.2
            });
          }
        }

        function draw() {
          context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
          points.forEach((point) => {
            point.x += point.vx;
            point.y += point.vy;
            if (point.x <= 0 || point.x >= canvas.clientWidth) point.vx *= -1;
            if (point.y <= 0 || point.y >= canvas.clientHeight) point.vy *= -1;
          });

          for (let i = 0; i < points.length; i += 1) {
            for (let j = i + 1; j < points.length; j += 1) {
              const dx = points[i].x - points[j].x;
              const dy = points[i].y - points[j].y;
              const distance = Math.hypot(dx, dy);
              if (distance < 115) {
                context.strokeStyle = `rgba(79, 225, 255, ${1 - distance / 115})`;
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(points[i].x, points[i].y);
                context.lineTo(points[j].x, points[j].y);
                context.stroke();
              }
            }
          }

          points.forEach((point) => {
            context.fillStyle = "rgba(255, 216, 94, 0.86)";
            context.beginPath();
            context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
            context.fill();
          });

          window.requestAnimationFrame(draw);
        }

        resizeCanvas();
        seedPoints();
        draw();
        window.addEventListener("resize", () => {
          resizeCanvas();
          seedPoints();
        });
        console.log("[AutomateX] Network canvas initialized");
      }

      function initThreeScene() {
        const canvas = document.getElementById("threeCanvas");
        if (!canvas) return;

        if (!window.THREE) {
          console.log("[AutomateX] THREE unavailable, fallback toys remain visible");
          return;
        }

        try {
          const renderer = new window.THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
          });
          const scene = new window.THREE.Scene();
          const camera = new window.THREE.PerspectiveCamera(45, 1, 0.1, 100);
          camera.position.set(0, 0, 7);

          const ambient = new window.THREE.AmbientLight(0xffffff, 1.2);
          const point = new window.THREE.PointLight(0x4fe1ff, 1.8, 100);
          point.position.set(4, 4, 6);
          const pointTwo = new window.THREE.PointLight(0x7e6dff, 1.3, 100);
          pointTwo.position.set(-4, -3, 5);
          scene.add(ambient, point, pointTwo);

          const objects = [];
          const mobile = window.innerWidth < 768;
          const total = prefersReducedMotion ? 3 : mobile ? 4 : 6;

          const materials = [
            new window.THREE.MeshStandardMaterial({ color: 0x4fe1ff, emissive: 0x16374a, roughness: 0.25, metalness: 0.2 }),
            new window.THREE.MeshStandardMaterial({ color: 0x7e6dff, emissive: 0x261d55, roughness: 0.28, metalness: 0.15 }),
            new window.THREE.MeshStandardMaterial({ color: 0xffd85e, emissive: 0x5a4610, roughness: 0.3, metalness: 0.12 })
          ];

          for (let index = 0; index < total; index += 1) {
            const isSphere = index % 2 === 0;
            const geometry = isSphere
              ? new window.THREE.SphereGeometry(0.46, 24, 24)
              : new window.THREE.BoxGeometry(0.72, 0.72, 0.72);
            const mesh = new window.THREE.Mesh(geometry, materials[index % materials.length]);
            mesh.position.set((Math.random() - 0.5) * 4.5, (Math.random() - 0.5) * 3.4, (Math.random() - 0.5) * 2);
            scene.add(mesh);
            objects.push(mesh);
          }

          function resize() {
            const bounds = canvas.parentElement.getBoundingClientRect();
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.setSize(bounds.width, bounds.height, false);
            camera.aspect = bounds.width / bounds.height;
            camera.updateProjectionMatrix();
          }

          function render() {
            objects.forEach((mesh, index) => {
              const speed = 0.003 + index * 0.0008;
              mesh.rotation.x += speed;
              mesh.rotation.y += speed * 1.4;
              mesh.position.y += Math.sin(Date.now() * 0.001 + index) * 0.0015;
            });
            camera.position.x = Math.sin(Date.now() * 0.00025) * 0.3;
            renderer.render(scene, camera);
            window.requestAnimationFrame(render);
          }

          resize();
          render();
          window.addEventListener("resize", resize);
          console.log("[AutomateX] Three.js scene initialized");
        } catch (error) {
          console.log("[AutomateX] Three.js failed, fallback toys remain visible", error);
        }
      }

      function initLottie() {
        const container = document.getElementById("lottieShell");
        if (!container) return;
        if (!window.lottie) {
          console.log("[AutomateX] Lottie unavailable, fallback toys remain visible");
          return;
        }

        try {
          const mount = document.createElement("div");
          mount.style.position = "absolute";
          mount.style.inset = "0";
          mount.style.display = "grid";
          mount.style.placeItems = "center";
          container.appendChild(mount);

          window.lottie.loadAnimation({
            container: mount,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "https://assets10.lottiefiles.com/packages/lf20_x62chJ.json"
          });
          console.log("[AutomateX] Lottie initialized");
        } catch (error) {
          console.log("[AutomateX] Lottie failed, fallback toys remain visible", error);
        }
      }

      function initThemeSystem() {
        if (!topbarInner) return;

        const themes = [
          { name: "dark", label: "D", title: "Dark mode" },
          { name: "light", label: "L", title: "Light mode" },
          { name: "neon-moon", label: "N", title: "Neon Moon mode" }
        ];

        let tools = topbarInner.querySelector(".topbar-tools");
        if (!tools) {
          tools = document.createElement("div");
          tools.className = "topbar-tools";
          topbarInner.appendChild(tools);
        }

        const switcher = document.createElement("div");
        switcher.className = "theme-switcher";
        switcher.setAttribute("role", "tablist");
        switcher.setAttribute("aria-label", "Theme switcher");

        function setTheme(themeName) {
          body.setAttribute("data-theme", themeName);
          localStorage.setItem("automatex-theme", themeName);
          switcher.querySelectorAll(".theme-option").forEach((button) => {
            const active = button.dataset.theme === themeName;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", active ? "true" : "false");
          });
        }

        themes.forEach((theme) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "theme-option";
          button.dataset.theme = theme.name;
          button.textContent = theme.label;
          button.title = theme.title;
          button.setAttribute("role", "tab");
          button.setAttribute("aria-label", theme.title);
          button.addEventListener("click", () => setTheme(theme.name));
          switcher.appendChild(button);
        });

        tools.appendChild(switcher);

        const savedTheme = localStorage.getItem("automatex-theme") || "dark";
        setTheme(savedTheme);
      }

      function initMobileNav() {
        if (!topbarInner || !topnav) return;

        let tools = topbarInner.querySelector(".topbar-tools");
        if (!tools) {
          tools = document.createElement("div");
          tools.className = "topbar-tools";
          topbarInner.appendChild(tools);
        }

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "topnav-toggle";
        toggle.setAttribute("aria-label", "Toggle navigation");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-controls", "primary-nav");
        toggle.innerHTML = "<span></span>";
        tools.appendChild(toggle);
        topnav.id = "primary-nav";

        function closeNav() {
          topnav.classList.remove("is-open");
          toggle.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          body.classList.remove("nav-open");
        }

        toggle.addEventListener("click", () => {
          const next = !topnav.classList.contains("is-open");
          topnav.classList.toggle("is-open", next);
          toggle.classList.toggle("is-open", next);
          toggle.setAttribute("aria-expanded", next ? "true" : "false");
          body.classList.toggle("nav-open", next);
        });

        topnav.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", closeNav);
        });

        window.addEventListener("resize", () => {
          if (window.innerWidth > 859) closeNav();
        });
      }

      function initTopbarState() {
        if (!topbar) return;
        const update = () => {
          topbar.classList.toggle("is-scrolled", window.scrollY > 18);
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
      }

      function initActiveNavLinks() {
        if (!topnav || !sections.length) return;
        const links = Array.from(topnav.querySelectorAll("a[href^='#']"));

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            links.forEach((link) => {
              link.classList.toggle("active-link", link.getAttribute("href") === `#${id}`);
            });
          });
        }, { threshold: 0.45 });

        sections.forEach((section) => observer.observe(section));
      }

      function initPointerHighlights() {
        const interactiveSelector = ".pill, .cta, .copy-button, .toy-button, .story-nav button, .social-pill, .toggle-shell";
        document.querySelectorAll(interactiveSelector).forEach((node) => {
          node.addEventListener("pointermove", (event) => {
            const rect = node.getBoundingClientRect();
            node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
            node.style.setProperty("--my", `${event.clientY - rect.top}px`);
          });
        });
      }

      function initCursorOrb() {
        if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
        const orb = document.createElement("div");
        orb.className = "cursor-orb";
        body.appendChild(orb);

        const moveToX = window.gsap ? window.gsap.quickTo(orb, "x", { duration: 0.25, ease: "power3.out" }) : null;
        const moveToY = window.gsap ? window.gsap.quickTo(orb, "y", { duration: 0.25, ease: "power3.out" }) : null;

        document.addEventListener("pointermove", (event) => {
          orb.style.opacity = "1";
          if (moveToX && moveToY) {
            moveToX(event.clientX);
            moveToY(event.clientY);
          } else {
            orb.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
          }
        }, { passive: true });

        document.addEventListener("pointerleave", () => {
          orb.style.opacity = "0";
        });
      }

      function initWindowLoadFallback() {
        window.addEventListener("load", () => {
          console.log("[AutomateX] window.load fired");
          hideLoaderSoon();
        });

        window.addEventListener("error", (event) => {
          console.log("[AutomateX] Global error captured:", event.message);
          topLoader.classList.remove("visible");
        });
      }

      const memory = updateVisitMemory();
      initThemeSystem();
      applyMood(memory);
      initMobileNav();
      initTopbarState();
      initActiveNavLinks();
      initPointerHighlights();
      initCursorOrb();
      initWindowLoadFallback();
      initCopyButtons();
      initToggleToy();
      initTypingConsole();
      initTiltCards();
      initMascot();
      initSectionGuide();
      initStory();
      initNetworkCanvas();
      initThreeScene();
      initLottie();
      hideLoaderSoon();

      console.log("[AutomateX] Initialization complete");
    });
