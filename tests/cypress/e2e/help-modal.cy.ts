import i18n from "@/i18n";

// Get all help entries in localisation file
const helpEntries = Object.values(i18n.t("help") as any) as {title: string, content: string}[];

describe("Help modal loads and displays correctly", () => {
    it("Loads and displays the help modal", () => {
        cy.visit("./");
        cy.get("#helpModalDlg").should("not.exist");
        cy.get("button[aria-label='Help']").click();
        cy.wait(100);
        cy.get("#helpModalDlg").should("exist");
        cy.get("#helpModalDlg").within(() => {
            cy.get(".help-nav-counter").invoke("text").should("match", /\d+\s*\/\s*\d+/);
            cy.get(".modal-title").contains(helpEntries[0].title as string).should("exist");
            cy.get("#help-content").should("exist");
            cy.get("#help-gif").should("exist");
            // Check content line by line to avoid issues with HTML tags in the content
            for (const line of helpEntries[0].content.split("\n")) {
                cy.get("#help-content").contains(line.trim()).should("exist");
            }
        });
    });
});

describe("Help modal can be navigated between steps", () => {
    it("Can navigate between steps in the help modal", () => {
        cy.visit("./");
        cy.get("button[aria-label='Help']").click();
        cy.wait(100);
        cy.get("#helpModalDlg").within(() => {
            cy.get("button[aria-label='Next']").click({force: true});
            cy.contains(helpEntries[1].title as string).should("exist");
            cy.get("button[aria-label='Next']").click({force: true});
            cy.contains(helpEntries[2].title as string).should("exist");
            cy.get("button[aria-label='Previous']").click();
            cy.get("button[aria-label='Previous']").click();
            cy.contains(helpEntries[0].title as string).should("exist");
        });
    });
});

describe("Help modal counters update correctly", () => {
    it("Updates the help modal counter correctly when navigating between steps", () => {
        cy.visit("./");
        cy.get("button[aria-label='Help']").click();
        cy.wait(100);
        cy.get("#helpModalDlg").within(() => {
            cy.get(".help-nav-counter").invoke("text").should("match", /1\s*\/\s*\d+/);
            cy.get("button[aria-label='Next']").click();
            cy.get(".help-nav-counter").invoke("text").should("match", /2\s*\/\s*\d+/);
            cy.get("button[aria-label='Next']").click();
            cy.get(".help-nav-counter").invoke("text").should("match", /3\s*\/\s*\d+/);
            cy.get("button[aria-label='Previous']").click();
            cy.get(".help-nav-counter").invoke("text").should("match", /2\s*\/\s*\d+/);
            cy.get("button[aria-label='Previous']").click();
            cy.get(".help-nav-counter").invoke("text").should("match", /1\s*\/\s*\d+/);
        });
    });
});

describe("Navigation loops back to start/end of help modal", () => {
    it("Loops back to the start/end of the help modal when navigating past the end/start", () => {
        cy.visit("./");
        cy.get("button[aria-label='Help']").click();
        cy.wait(100);
        cy.get("#helpModalDlg").within(() => {
            const numEntries = helpEntries.length;
            for (let i = 1; i < numEntries + 1; i++) {
                const re = new RegExp(`^${i} / ${numEntries + 1}$`);
                cy.get(".help-nav-counter").invoke("text").should("match", re);
                cy.get("button[aria-label='Next']").click();
                cy.wait(100);   
            }
            // Click next again (final page leads user to tutorial)
            cy.get("button[aria-label='Next']").click();
            // Check we're back at the start
            cy.contains(helpEntries[0].title as string).should("exist");
            const re = new RegExp(`^1 / ${numEntries + 1}$`);
            cy.get(".help-nav-counter").invoke("text").should("match", re);
        });
    });
});

describe("Help modal contains a link to the tutorial", () => {
    it("Contains a link to the tutorial on the final page", () => {
        cy.visit("./");
        cy.get("button[aria-label='Help']").click();
        cy.wait(100);
        cy.get("#helpModalDlg").within(() => {
            const numEntries = helpEntries.length;
            // navigate to the final page
            for (let i = 0; i < numEntries; i++) {
                cy.get("button[aria-label='Next']").click();
                cy.wait(100);   
            }
            // Check contains tutorial title, message and button to tutorial
            cy.get(".modal-title").contains(i18n.t("tutorials.openTutorialTitle") as string).should("exist");
            cy.get(".modal-body").contains(i18n.t("tutorials.openTutorialMessage") as string).should("exist");
            // Check clicking open tutorial button opens tutorial dialog
            cy.get("#open-tutorials-btn").contains("Open Tutorials").click();
            cy.wait(100);
        });
        cy.get("#load-strype-tutorial-modal-dlg").should("exist");
    });
});

describe("Help modal can be dismissed", () => {
    it("Can close the help modal", () => {
        cy.visit("./");
        cy.get("button[aria-label='Help']").click();
        cy.wait(100);
        cy.get("#helpModalDlg").should("exist");
        cy.get("#helpModalDlg").within(() => {
            cy.get("button.btn.btn-primary").click();
            cy.wait(100);
        });
        cy.get("#helpModalDlg").should("not.exist");
    });
});
