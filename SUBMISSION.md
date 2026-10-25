# ParadigmPath
## Project overview for presentation

### Summary

ParadigmPath is a browser-based adaptive tutor for introductory programming paradigms. It teaches functional thinking, imperative state, recursion, and higher-order functions. After each quiz answer, a Bayesian Knowledge Tracing model updates its estimate of the learner's mastery and uses those estimates to recommend a topic for the next practice session.

The adaptive model runs locally in the browser. ParadigmPath does not call a generative AI service or send quiz answers to a server.

### What the project demonstrates

- **Programming paradigms:** learning material and questions cover functional programming, imperative programming, recursion, and higher-order functions.
- **AI:** Bayesian inference estimates latent concept mastery from observed answers. A decision rule uses those estimates to select practice topics.
- **Software engineering:** the project separates HTML, CSS, and JavaScript; validates saved browser state; explains recommendations; supports reset and reproducible demonstrations; and documents limitations.

### How the model works

The model keeps a separate mastery probability for each concept. It starts each concept at 25%. On every answer, it uses Bayes' rule to account for the possibility that a learner may guess correctly or answer incorrectly despite knowing the topic. It then applies a 12% learning transition to represent learning during practice.

Demo parameters are `P(guess)=0.20`, `P(slip)=0.10`, and `P(learn)=0.12`. These are transparent illustrative defaults, not values trained from classroom data. The recommendation rule favors concepts with greater remaining learning opportunity, gives a small initial-baseline bonus to unseen topics, and slightly penalizes the most recently practiced topic.

### Suggested live demonstration

1. Open the website in a clean browser profile or reset its saved progress on the **How your AI works** page.
2. Show that each concept begins at a 25% estimated mastery.
3. Start a practice session and answer all three questions. Point out that the estimate updates after each response and that the site explains each answer.
4. Finish the session and show that the recommendation and mastery dashboard have changed.
5. Open **How your AI works** and explain the guess, slip, and learning parameters.
6. Reset progress and repeat with different answers to show that evidence changes the estimates.

### What the project does not claim

ParadigmPath is an educational prototype, not a validated learning product. Its question bank is small, its parameters are illustrative, and a multiple-choice answer is imperfect evidence of understanding. The project has not been evaluated against real learners or shown to outperform a non-adaptive study plan. The next research step would be a controlled comparison with a round-robin baseline over simulated and then real learner data.

### Short presentation script

> ParadigmPath is an adaptive programming-concepts tutor. It teaches several programming paradigms and uses Bayesian Knowledge Tracing to estimate a learner's mastery from quiz answers. The model runs locally, adjusts its estimate after each answer, and recommends which concept to practice next. I made the recommendation explainable so a learner can inspect why a topic was selected. This is a prototype with illustrative model parameters; it demonstrates the method, but it has not yet been validated with real learners.
