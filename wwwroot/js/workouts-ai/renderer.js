/**
 * Renderer module for Workouts AI
 * Handles Markdown to HTML conversion and card generation
 */

export function renderMarkdownToHTML(text) {
    if (!text) return "";

    // Escape HTML first
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Split into lines for better processing
    const lines = html.split("\n");
    const processed = [];
    let inList = false;
    let listItems = [];
    let listType = null;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Check for list items
      const bulletMatch = line.match(/^\s*[-*•]\s+(.+)$/);
      const numberedMatch = line.match(/^\s*\d+\.\s+(.+)$/);

      if (bulletMatch) {
        if (!inList || listType !== "ul") {
          if (inList) {
            processed.push(wrapList(listItems, listType));
            listItems = [];
          }
          inList = true;
          listType = "ul";
        }
        listItems.push(bulletMatch[1]);
      } else if (numberedMatch) {
        if (!inList || listType !== "ol") {
          if (inList) {
            processed.push(wrapList(listItems, listType));
            listItems = [];
          }
          inList = true;
          listType = "ol";
        }
        listItems.push(numberedMatch[1]);
      } else {
        // Not a list item
        if (inList) {
          processed.push(wrapList(listItems, listType));
          listItems = [];
          inList = false;
          listType = null;
        }
        processed.push(line);
      }
    }

    if (inList) {
      processed.push(wrapList(listItems, listType));
    }

    html = processed.join("\n");

    // Process headings (must be on their own line)
    html = html.replace(
      /^####\s+(.+)$/gm,
      '<h5 class="urbanist-bold text-blue mt-4 mb-2">$1</h5>'
    );
    html = html.replace(
      /^###\s+(.+)$/gm,
      '<h4 class="urbanist-bold text-blue mt-4 mb-3">$1</h4>'
    );
    html = html.replace(
      /^##\s+(.+)$/gm,
      '<h3 class="urbanist-bold text-blue mt-4 mb-3">$1</h3>'
    );
    html = html.replace(
      /^#\s+(.+)$/gm,
      '<h2 class="urbanist-bold text-blue mt-5 mb-3">$1</h2>'
    );

    // Bold and italic
    html = html.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="text-blue">$1</strong>'
    );
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

    // Horizontal rules
    html = html.replace(/^---+$/gm, '<hr class="my-4 border-blue">');

    // Convert double newlines to paragraphs
    html = html.replace(
      /\n\n+/g,
      '</p><p class="urbanist-medium text-black mb-3">'
    );
    html = '<p class="urbanist-medium text-black mb-3">' + html + "</p>";

    // Clean up empty paragraphs
    html = html.replace(/<p[^>]*>\s*<\/p>/g, "");

    return html;
  }

  function wrapList(items, type) {
    if (items.length === 0) return "";
    const tag = type === "ul" ? "ul" : "ol";
    const listClass = type === "ul" ? "list-unstyled ms-3 mb-3" : "ms-4 mb-3";

    const liItems = items
      .map((item) => {
        // Process inline formatting in list items
        let formatted = item
          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-blue">$1</strong>')
          .replace(/\*(.+?)\*/g, "<em>$1</em>");

        return type === "ul"
          ? `<li class="urbanist-medium text-black mb-2"><i class="fas fa-check-circle text-blue me-2"></i>${formatted}</li>`
          : `<li class="urbanist-medium text-black mb-2">${formatted}</li>`;
      })
      .join("\n");

    return `<${tag} class="${listClass}">\n${liItems}\n</${tag}>`;
  }

  export function createExportableCard(planHTML, userName) {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
            <div id="exportablePlanCard">
                <div class="plan-header">
                    <div class="logo">
                        <i class="fas fa-dumbbell me-2"></i>FitSync
                    </div>
                    <div class="subtitle">Your Personalized Workout Plan</div>
                </div>
                
                ${
                  userName
                    ? `
                <div class="user-info">
                    <div class="user-name">
                        <i class="fas fa-user-circle me-2"></i>${userName}
                    </div>
                </div>
                `
                    : ""
                }
                
                <div class="plan-content">
                    ${planHTML}
                </div>
                
                <div class="plan-footer">
                    <div>Generated on ${currentDate}</div>
                    <div class="mt-1">
                        <i class="fas text-danger"></i> Made with FitSync AI
                    </div>
                </div>
            </div>
        `;
  }
