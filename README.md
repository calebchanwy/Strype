<img src="public/favicon.png" width="64" align="left">

# Strype

Strype is a frame-based editor for Python that runs entirely in the browser, designed for use in secondary schools.  You can learn more and use the free public release at <a href="https://strype.org/" target="_blank">strype.org</a>. 

Strype is maintained by Michael Kölling and the K-PET group at King's College London, alongside their other tools, BlueJ and Greenfoot.

License
---

This repository contains the source code for Strype, licensed under the AGPLv3 (see [LICENSE.txt](LICENSE.txt)).  You can use and modify the code according to that license, but be aware that the Strype name, logo, and other visual assets belong to the Strype team.

Tutorials
---
This repository focuses on adding an inbuilt tutorial system to Strype as part of the final year project.
The Strype tutorial system aims to make onboarding smoother for Strype users and provides a framework for teachers to create their own custom tutorials for students to load.

### Features
1. Selection of pre-built tutorials for new users to choose from, including Strype onboarding and basic Python projects.
2. Import and export tutorials as `.spy` files, to easily share with students.
3. Step-by-step interactive tutorial panel built within the editor.
4. Apply highlights (stencils) over U.I. components to focus user attention.
5. Set expected outcomes and code structure for students to reach.
6. Always accessible help modal for Strype quick tips and refreshers.

### File Syntax
Strype tutorials are contained in a section within `.spy` files, identified by `#(=> Section:Tutorial`, expressed in `YAML` format.

A tutorial consists of a collection of steps, where each step is described with:
- title 
    - Short summary of a given step.
- description
    - Describes a step, outlining more detail about the specific instruction.
- media (optional)
    - URL or link to file to be embedded into the step.
    - Options: Image file, Video file, YouTube link or generic embed link.
- requiredComponents (optional)
    - A list of required code statements and their required counts that a user must meet before progressing to next step of the tutorial.
    - Options: `funccall`, `import`, `classdef`, `funcdef`, `varassign`, `return` etc. Full list of identifiers can be found at [src/types/types.ts](src/types/types.ts).
- stencil (optional)
    - Applies a highlight affect to one or more U.I. components, dimming all other components.
    - Options: `menu`, `tutorial`, `documentation`, `imports`, `definitions`, `mainCode`, `commands`, `pea`, `editor`. These are defined under [src/helpers/editor.ts](src/helpers/editor.ts).

If a final console output is expected, `expectedOutput` and `expectedOutputMessage` can be defined.
When the `expectedOutput` is reached, the `expectedOutputMessage` is displayed in a pop-up to notify users.

Example Tutorial Project File (`.spy`):
``` yaml
#(=> Strype:1:std
'''Variables and printing'''
#(=> Section:Tutorial
expectedOutput: "47"
expectedOutputMessage: "Nice — variable assignment and print worked!"
steps:
- title: "Create variable"
  description: "Assign a number to a variable and print it using the print function. For example: message = 47\nprint(message)"
  stencil: mainCode
  requiredComponents:
    varassign: 1
    funccall: 1
  media: https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/250px-Python-logo-notext.svg.png?_=20250701090410
#(=> Section:Imports
#(=> Section:Definitions
#(=> Section:Main
#(=> Section:End

```

Building and running
---

Strype is a <a href="https://v2.vuejs.org/" target="_blank">Vue 2</a> project (upgrading to Vue 3 is planned for 2025) that uses NPM as its core tool.  To build you will first need to install <a href="https://nodejs.org/en" target="_blank">Node.js</a> (or <a href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm" target="_blank">another method</a>) to get NPM.

Then, to run a local test version you can run the following commands in the top level of the checked out repository:

```
npm install
npm run serve:python
```

If you want to create a packaged version to distribute or host somewhere, run:

```
npm run build
```

A publicly available demo link deployed to GitHub pages can be found here: [Demo Deployment](https://calebchanwy.github.io/Strype/).
If the above link does not work, deployment runs can be found here: [GitHub Pages Deployments](https://github.com/calebchanwy/Strype/deployments/github-pages) 

Strype is currently an entirely client-side tool; there is no server component to run alongside.

Development
---

To work on the project, you can use a variety of tools: our team members use <a href="https://code.visualstudio.com/" target="_blank">VS Code</a> or <a href="https://www.jetbrains.com/webstorm/" target="_blank">Webstorm</a>.  To run the full test suite (which takes 2+ hours) you can run:

```
npm run test:cypress
npm run test:playwright
```

To speed up the Cypress tests locally, we can target specific tests by setting an environment variable, e.g. this would work on Mac and Linux
```
SPEC="autocomplete.cy.ts" npm run:test:cypress
```

This item can have wildcards, e.g.

```
SPEC="**/autocomplete*.cy.ts" npm run:test:cypress
```

You can also change the relevant ```describe``` function call in the test file into ```describe.only``` to only run that test in the file. Be aware that it will silently turns off all the other tests!  **Do not commit this change!**

To run a specific Playwright test, you can do the same with SPEC, e.g. this would work on Mac and Linux:
```
SPEC="graphics.spec.ts" npm run test:playwright 
```

The tests and linter are run automatically in Github actions and they should always pass before changes are merged in.  You can run the linter manually with:

```
npm run lint:check
```


Contributing
---

We readily accept pull requests for translations or bug fixes.  If you plan to add an entirely new feature or noticeably change existing behaviour we advise you to get in contact with us first, as we are likely to refuse any pull requests which are not part of our plan for Strype.  Our experience is that one of the important features for novice tools is their simplicity, which is achieved by being very conservative in which features we choose to add.

Current team:
- Neil Brown (King's College London)
- Michael Kölling (King's College London)
- Pierre Weill-Tessier (King's College London)

Other contributors:
- Tobias Kohn (<a href="https://github.com/Tobias-Kohn/TigerPython-Parser" target="_blank">TigerPython parser</a>)
- Babis Kyfonidis
- Zak Singh
- Aleksandr Voronstov

Translators:
- Chinese: Rongkun Liu
- French: Pierre Weill-Tessier
- German: Michael Kölling
- Greek: Babis Kyfonidis
- Spanish: Emma Dodoo and Nolgie Oquendo-Colon

Roadmap
---

Strype is currently under very active development.  A rough roadmap of some major planned features (beyond the general bugfixing and polishing):

 - Add class frames (for object-oriented programming): Q4 2025
 - Add support for loading/saving Strype projects from/to OneDrive: Q4 2025
 - Provide a translation helper tool for localisation: Q4 2025
 - Internal backend update for Strype's Python emulation: Q1 2026
 - Add support for data processing and/or charting: Q2 2026
 - Add support for loading/saving Strype projects from/to German Bundesland-specific Cloud Drives: Q1 2026
 - Extent the micro:bit simulator's features: Q3 2026

The dates and choices may change as we receive more user feedback.
