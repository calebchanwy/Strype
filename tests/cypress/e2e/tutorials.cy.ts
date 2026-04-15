// This does the beforeEach bits for us:
import "../support/autocomplete-test-support";
import i18n from "@/i18n";
import {strypeElIds} from "../support/autocomplete-test-support";
import {loadFile} from "../support/load-save-support";


/**
 * Loads a given tutorial file into the Strype editor
 */
function loadTutorialFile(filepath: string) {
    cy.readFile(filepath).then(() => {
        
        // Clear existing editor space
        cy.get("#" + strypeElIds.getFrameUID(-3), {timeout: 15 * 1000}).focus();
        cy.get("body").type("{uparrow}{uparrow}{uparrow}{del}{downarrow}{downarrow}{downarrow}{downarrow}{backspace}{backspace}");
        loadFile(strypeElIds, filepath);

        // We must make sure there are no comment frames starting "(=>" because that would indicate
        // our special comments have become comment frames, rather than being processed:
        // Making sure there"s zero items is awkward in Cypress so we drop to doing it manually:
        cy.document().then((doc) => {
            const spans = Array.from(doc.querySelectorAll("span.comment-slot"));
            const matching = spans.filter((el) => el.textContent?.trim().startsWith("(=>"));
            expect(matching.length).to.eq(0);
        });
        
        // We make sure there are no slots containing ___strype_ because they should have been processed:
        cy.document().then((doc) => {
            const spans = Array.from(doc.querySelectorAll("span"));
            const matching = spans.filter((el) => el.textContent?.includes("___strype_"));
            expect(matching.length).to.eq(0);
        });
    });
}

describe("Tutorial dialog", () => {
    it("Basic tutorial dialog functionality", () => {
        if (Cypress.env("mode") == "microbit") {
            // Tutorials may not show in microbit mode
            return;
        }

        cy.get("button#" + strypeElIds.getEditorMenuUID()).click({force: true});
        cy.contains(i18n.t("appMenu.loadTutorial") as string).click({force: true});
        // Check the main two categories are there:
        cy.contains(".list-group-item", "Onboarding").should("exist");
        cy.contains(".list-group-item", "Examples").should("exist");
        // Ensure the button to open a custom/tutorial project is present
        cy.contains(".list-group-item", i18n.t("tutorials.openProject") as string).should("exist");
        cy.contains(".list-group-item", "Onboarding").click();

        // Check onboarding tutorials are present
        cy.contains(".tutorial-dlg-name", "Strype Walkthrough").should("exist");
        cy.contains(".tutorial-dlg-name", "An Introduction To Frames").should("exist");
        cy.contains(".tutorial-dlg-name", "Keyboard Commands").should("exist");
        cy.contains(".tutorial-dlg-name", "Using the Console").should("exist");
        cy.contains(".tutorial-dlg-name", "Python Basics").should("exist");


        // Now check the Examples category contains expected tutorials
        cy.contains(".list-group-item", "Examples").click();
        cy.contains(".tutorial-dlg-name", "Hello World!").should("exist");
        cy.contains(".tutorial-dlg-name", "Number Guessing Game").should("exist");
        cy.contains(".tutorial-dlg-name", "Rock Paper Scissors").should("exist");
        

        // Test selecting an onboarding tutorial and check the content loads as expected
        cy.contains(".list-group-item", "Onboarding").click();
        cy.contains(".tutorial-dlg-name", "Strype Walkthrough").click();
        cy.contains(".btn", "OK").click();
        cy.wait(500);
        // Check part of the code actually shows:
        cy.contains(".tutorial-step-title","Welcome to Strype!").should("exist");
        cy.contains(".tutorial-step-desc","Watch this short video introducing Strype and frame based development. After watching the video, we will introduce the different parts of the user interface.").should("exist");
    });
});

describe("Tutorial navigation", () => {
    it("Navigates between steps in a tutorial", () => {
        if (Cypress.env("mode") == "microbit") {
            // Tutorials may not show in microbit mode
            return;
        }
        // Load the instructional steps fixture and navigate
        loadTutorialFile("tests/cypress/fixtures/tutorial-instructional-steps.spy");
        cy.wait(500);

        // Check we"re on the first step from the fixture
        cy.contains(".tutorial-step-title", "Welcome!").should("exist");
        // Progress indicator should show 1 / 5
        cy.get(".tutorial-steps-progress").contains("1 / 5");
        // Click next and check the content changes to the second step
        cy.contains(".btn", "Next").click();
        cy.contains(".tutorial-step-title", "First Steps").should("exist");
        // Click previous and check we go back to the first step
        cy.contains(".btn", "Previous").click();
        cy.contains(".tutorial-step-title", "Welcome!").should("exist");
    });
});

describe("Tutorial progression disabled when required components aren't present", () => {
    it("Prevents progressing if required components aren't present", () => {
        if (Cypress.env("mode") == "microbit") {
            // Tutorials may not show in microbit mode
            return;
        }
        // Load the required-components tutorial fixture
        loadTutorialFile("tests/cypress/fixtures/tutorial-required-components.spy");
        cy.wait(500);

        // Check we"re on the first step from the fixture
        cy.contains(".tutorial-step-title", "Import library").should("exist");
        // The required components message should be shown (no components present)
        cy.contains(".tutorial-step-message", i18n.t("tutorials.missingComponents") as string).should("exist");
        // The counts list should be rendered with at least one required component
        cy.get(".tutorial-step-counts .list-group-item").should("have.length.greaterThan", 0);
        // Expect at least one badge showing 0 / 1 (required but not met)
        cy.get(".tutorial-step-counts .list-group-item span.badge").contains(/0\s*\/\s*1/);
    });
});

describe("Tutorial progression with required components", () => {
    it("Allows progression once required components are present", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the required-components tutorial fixture
        loadTutorialFile("tests/cypress/fixtures/tutorial-required-components.spy");
        cy.wait(500);

        // We"re on the first step which requires an import
        cy.contains(".tutorial-step-title", "Import library").should("exist");
        // Next should be disabled initially
        cy.contains(".btn", "Next").should("be.disabled");

        // Add the required import at the top using keyboard input
        cy.get("body").type("{uparrow}{uparrow}i math{downarrow}{downarrow}");
        cy.wait(500);

        // Missing components message should be gone
        cy.contains(".tutorial-step-message", i18n.t("tutorials.missingComponents") as string).should("not.exist");
        // Badge should now show 1 / 1
        cy.get(".tutorial-step-counts .list-group-item span.badge").contains(/1\s*\/\s*1/);
        // Next should be enabled and advance to the next step
        cy.contains(".btn", "Next").should("not.be.disabled").click();
        cy.contains(".tutorial-step-title", "From-import").should("exist");
    });
});

describe("Tutorial stencil highlights correct components", () => {
    it("Highlights components specified in the tutorial steps", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the stencils fixture
        loadTutorialFile("tests/cypress/fixtures/tutorial-stencils.spy");
        cy.wait(500);
        // Check the stencil highlights the expected UI elements (by known IDs)
        cy.get("#editor").should("have.class", "stencil-highlight");

        cy.contains(".btn", "Next").click();
        cy.get("#menu-bar").should("have.class", "stencil-highlight");

        cy.contains(".btn", "Next").click();
        cy.get("#tutorialStepsPanel").should("have.class", "stencil-highlight");

        // Project documentation frame (fixed ID of -10)
        cy.contains(".btn", "Next").click();
        cy.get("#frameHeader_-10").should("have.class", "stencil-highlight");

        // As we have an empty program, we know the IDs of the main UI frames
        // Imports frame container
        cy.contains(".btn", "Next").click();
        cy.get("#frameContainer_-1").should("have.class", "stencil-highlight");

        // Definition frame container
        cy.contains(".btn", "Next").click();
        cy.get("#frameContainer_-2").should("have.class", "stencil-highlight");

        //Main Code frame container
        cy.contains(".btn", "Next").click();
        cy.get("#frameContainer_-3").should("have.class", "stencil-highlight");

        cy.contains(".btn", "Next").click();
        cy.get("#editorCommands").should("have.class", "stencil-highlight");

        cy.contains(".btn", "Next").click();
        cy.get("#peaComponent").should("have.class", "stencil-highlight");
    });
});

describe("Tutorial stencil removes previous highlights", () => {
    it("Removes previous highlights when navigating to a new step", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the stencils fixture
        loadTutorialFile("tests/cypress/fixtures/tutorial-stencils.spy");
        cy.wait(500);
        // Click next to go to the second step which has a different stencil
        cy.contains(".btn", "Next").click();
        // Check only one stencil-highlight is present and it targets the menu and the tutorial panel (by default)
        cy.get(".stencil-highlight").should("have.length", 2);
        cy.get(".stencil-highlight").first().invoke("attr", "id").should("include", "menu");
    });
});

describe("Clicking on stencil overlay dismisses stencil", () => {
    it("Dismisses the stencil when clicking on the background overlay", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the stencils fixture
        loadTutorialFile("tests/cypress/fixtures/tutorial-stencils.spy");
        cy.wait(500);
        // Click on the stencil (overlay element id)
        cy.get("#strypeStencilOverlay").click({force: true});
        // Check the stencil is dismissed, meaning no elements have the stencil-highlight class
        cy.get(".stencil-highlight").should("have.length", 0);
    });
});

describe("Reaching expected outcome in tutorial shows message", () => {
    it("Shows expected outcome message when the expected outcome is reached", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the expected outcome fixture
        loadTutorialFile("tests/cypress/fixtures/tutorial-expected-outcome.spy");
        cy.wait(500);
        // Add print statement that matches the expected outcome using keyboard input
        cy.get("body").type("{downarrow}{downarrow}p'Hello world!'{downarrow}{downarrow}");
        // Run the code
        cy.contains("#runButton", "Run").click();
        // Check the expected outcome message is shown
        cy.contains("#appSimpleMsgModalDlg", "Congratulations, you have finished the project!").should("exist");
        cy.contains(".btn", "OK").click();
        // Check the message is dismissed
        cy.contains("#appSimpleMsgModalDlg").should("not.exist");
    });
});

describe("Not reaching expected outcome in tutorial shows failure message", () => {
    it("Shows failure message when expected outcome isn't reached.", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the expected outcome fixture with a short timeout
        loadTutorialFile("tests/cypress/fixtures/tutorial-expected-outcome.spy");
        cy.wait(500);
        // Run the code without adding the expected print statement
        cy.contains("#runButton", "Run").click();
        // Check the expected outcome message is shown
        cy.contains("#appSimpleMsgModalDlg", i18n.t("tutorials.expectedOutcomeNotReached") as string).should("exist");
        cy.contains(".btn", "OK").click();
        // Check the message is dismissed
        cy.contains("#appSimpleMsgModalDlg").should("not.exist");
    });
});


describe("Embedded local source image in tutorial step", () => {
    it("Displays an embedded image in a tutorial step, from a local source", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the fixture with an embedded image
        loadTutorialFile("tests/cypress/fixtures/tutorial-media-local.spy");
        // Check the image is rendered with the correct src
        cy.get("#tutorial-media img").should("have.attr", "src").and("include", "./public/favicon.png");
    });
});

describe("Embedded online source image in tutorial step", () => {
    it("Displays an embedded image in a tutorial step", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the fixture with an embedded image
        loadTutorialFile("tests/cypress/fixtures/tutorial-media.spy");
        // Check the image is rendered with the correct src
        cy.get("#tutorial-media img").should("have.attr", "src").and("include", "https://strype.org/images/editor_snapshot.png");
    });
});

describe("Embedded local source video in tutorial step", () => {
    it("Displays an embedded video in a tutorial step, from a local source", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the fixture with an embedded video
        loadTutorialFile("tests/cypress/fixtures/tutorial-media-local.spy");
        cy.contains(".btn", "Next").click();
        cy.wait(100);    
        // Check the video is rendered with the correct src
        cy.get("#tutorial-media video").should("have.attr", "src").and("include", "./test-http-assets/mov_bbb.mp4");
    });
});

describe("Embedded online video in tutorial step", () => {
    it("Displays an embedded video in a tutorial step", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the fixture with an embedded video
        loadTutorialFile("tests/cypress/fixtures/tutorial-media.spy");    
        cy.contains(".btn", "Next").click();
        cy.wait(100);    
        // Check the video element is rendered with the correct src
        cy.get("#tutorial-media video").should("have.attr", "src").and("include", "https://www.w3schools.com/html/mov_bbb.mp4");
    });
});


describe("Non-embedded youtube video in tutorial step", () => {
    it("Displays an embedded youtu.be video in a tutorial step", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the fixture with an embedded shortened YouTube video
        loadTutorialFile("tests/cypress/fixtures/tutorial-media.spy");
        for (let i = 0; i < 2; i++) {
            cy.contains(".btn", "Next").click();
            cy.wait(100);
        }
        // Check the iframe element is rendered with the correct src
        cy.get("#tutorial-media iframe").should("have.attr", "src").and("include", "https://www.youtube.com/embed/xTBnZwv9LBk?autoplay=1");
    });
});

describe("Embedded youtube.com video in tutorial step", () => {
    it("Displays an embedded YouTube video in a tutorial step", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the fixture with an embedded YouTube video
        loadTutorialFile("tests/cypress/fixtures/tutorial-media.spy");
        for (let i = 0; i < 3; i++) {
            cy.contains(".btn", "Next").click();
            cy.wait(100);
        }
        // Check the iframe element is rendered with the correct src
        cy.get("#tutorial-media iframe").should("have.attr", "src").and("include", "https://www.youtube.com/embed/xTBnZwv9LBk?si=hUQWQq-zW8EUnfiE?autoplay=1");
    });
});

describe("Embedded iframe in tutorial step", () => {
    it("Displays an embedded iframe in a tutorial step", () => {
        if (Cypress.env("mode") == "microbit") {
            return;
        }
        // Load the fixture with an embedded iframe
        loadTutorialFile("tests/cypress/fixtures/tutorial-media.spy");
        for (let i = 0; i < 4; i++) {
            cy.contains(".btn", "Next").click();
            cy.wait(100);
        }
        // Check the iframe element is rendered with the correct src
        cy.get("#tutorial-media iframe").should("have.attr", "src").and("include", "https://www.example.com");
    });
});