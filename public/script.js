document.addEventListener('DOMContentLoaded', function() {
    const selectedItem = document.querySelector('input[name="item"]:checked').value;
    updateCardTitles(selectedItem);
    attachListenersToItemsAndStandards();
    setupBadges();  // Ensure badges are set up after DOM is fully loaded
});


document.addEventListener('DOMContentLoaded', function() {
    updateSubOptions('GRI'); // Automatically load GRI options on load
    attachListenersToItemsAndStandards(); // Set up listeners
});

function updateCardTitles(selectedItem) {
    const subheadings = {
        'Governance': 'governanceSubheadings',
        'Social': 'socialSubheadings',
        'Environment': 'EnvSubheadings',
        'Other': 'OtherSubheadings'
    };

    Object.values(subheadings).forEach(id => document.getElementById(id).style.display = 'none');
    const selectedElement = document.getElementById(subheadings[selectedItem]);
    if (selectedElement) {
        selectedElement.style.display = 'block';
        resetBadgeSelection(selectedElement);
        updateBadgeEventListeners(selectedElement);
    }
}

function updateSubOptions(selectedStandard) {
    fetch('standards.json')
    .then(response => response.json())
    .then(data => {
        const subOptions = data[selectedStandard] || [];
        const container = document.getElementById('subOptionsContainer');
        container.innerHTML = ''; // Clear existing content

        subOptions.forEach(option => {
            const badge = createBadge(option.name);
            container.appendChild(badge);
        });

        updateBadgeEventListeners(container);
    })
    .catch(error => console.error('Error loading standard data:', error));
}

function createBadge(text) {
    const badge = document.createElement('span');
    badge.className = 'badge bg-blue-lt cursor-pointer';
    badge.textContent = text;
    badge.onclick = () => {
        resetBadgeSelection(document.body);  // Clear previous selections
        badge.classList.add('bg-blue');  // Highlight the selected badge
        badge.classList.remove('bg-blue-lt');
        populateTable(text);  // Call populateTable with the badge text
    };
    return badge;
}


function handleBadgeClick(badge) {
    // Reset all badges across the entire document first
    resetBadgeSelection(document.body);

    // Then highlight the clicked badge
    badge.classList.add('bg-blue');
    badge.classList.remove('bg-blue-lt');

    // Determine if the clicked badge belongs to the "STANDARD" category and display the explainer card
    if (badge.parentNode.id === 'subOptionsContainer') { // Assuming badges under STANDARD are in this container
        showExplainerCard(badge.textContent);
    } else {
        hideExplainerCard();
    }
}

async function showExplainerCard(subOptionName) {
    try {
        const response = await fetch('standards.json');
        const standards = await response.json();

        // Find the right explainer text by searching through all standards
        let foundExplainer = "";
        for (let key in standards) {
            const option = standards[key].find(o => o.name === subOptionName);
            if (option) {
                foundExplainer = option.explainer; // Set the explainer if found
                break; // Exit the loop once the correct suboption is found
            }
        }

        if (foundExplainer) {
            const explainerCard = document.getElementById('explainerCard');
            explainerCard.querySelector('.card-title').textContent = `Explainer of ${subOptionName}`;
            explainerCard.querySelector('.text-secondary').innerHTML = foundExplainer; // Change to innerHTML to parse HTML tags
            explainerCard.style.display = 'block'; // Show the card with explainer text
        } else {
            hideExplainerCard(); // Hide the card if no explainer is found
        }
    } catch (error) {
        console.error('Error loading standards data:', error);
    }
}




function hideExplainerCard() {
    const explainerCard = document.getElementById('explainerCard');
    explainerCard.style.display = 'none'; // Hide the card
}



function resetBadgeSelection(container) {
    // This will query all badges in the document, not just in a specific container
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.classList.remove('bg-blue');
        badge.classList.add('bg-blue-lt');
    });
}


function updateBadgeEventListeners(container) {
    const badges = container.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('click', () => handleBadgeClick(badge));
    });
}


function attachListenersToItemsAndStandards() {
    document.querySelectorAll('input[name="item"], input[name="esgStandard"]').forEach(input => {
        input.onchange = () => {
            input.name === 'item' ? updateCardTitles(input.value) : updateSubOptions(input.value);
        };
    });
}

function populateTable(selectedGRI) {
    fetch('headings.json')
    .then(response => response.json())
    .then(headingsData => {
        const griHeaders = headingsData.GRI.find(gri => gri.name === selectedGRI);
        if (!griHeaders) {
            console.error('No header data found for:', selectedGRI);
            return;
        }

        const dynamicHeaders = ["Company"].concat(griHeaders.headers);
        const tableHeadings = document.getElementById('table-headings');
        tableHeadings.innerHTML = '';
        dynamicHeaders.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            tableHeadings.appendChild(th);
        });

        fetch('companies.json')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('table-body');
            tableBody.innerHTML = '';
            data.forEach(company => {
                const tr = document.createElement('tr');

                const tdCompany = document.createElement('td');
                const link = document.createElement('a');
                link.href = "#";
                link.className = "company-name";
                link.textContent = company.name;
                tdCompany.appendChild(link);
                tr.appendChild(tdCompany);

                griHeaders.headers.forEach(header => {
                    const td = document.createElement('td');
                    let content = company.standards && company.standards.GRI && company.standards.GRI[selectedGRI] && company.standards.GRI[selectedGRI].metrics && company.standards.GRI[selectedGRI].metrics[header] ? company.standards.GRI[selectedGRI].metrics[header] : "-";
                    // Check if the content is one of Yes, Partial, or No and replace it with a colored circle
                    if (content === "Yes" || content === "Partial" || content === "No") {
                        const span = document.createElement('span');
                        span.className = 'status-circle';
                        span.style.display = 'inline-block';
                        span.style.width = '10px';
                        span.style.height = '10px';
                        span.style.borderRadius = '50%';
                        span.style.marginRight = '5px';

                        switch (content) {
                            case "Yes":
                                span.style.backgroundColor = '#2fb344'; // Green
                                break;
                            case "Partial":
                                span.style.backgroundColor = '#f59f00'; // Yellow
                                break;
                            case "No":
                                span.style.backgroundColor = '#d63939'; // Red
                                break;
                        }
                        td.appendChild(span);
                        td.appendChild(document.createTextNode(content)); // Optional: show text beside the circle
                    } else {
                        td.textContent = content;
                    }
                    tr.appendChild(td);
                });

                tableBody.appendChild(tr);
            });

            // Event delegation for handling row and link clicks
            tableBody.addEventListener('click', function(event) {
                const target = event.target;
                if (target.tagName === 'A' && target.classList.contains('company-name')) {
                    event.stopPropagation(); // Prevent triggering row click event
                    const tr = target.closest('tr'); // Find the parent row
                    highlightRow(tr);
                    const companyName = target.textContent;
                    const companyData = data.find(comp => comp.name === companyName);
                    updateCard(companyData, selectedGRI);
                    updateFirstTabLabel(companyName);
                } else if (target.tagName === 'TD') {
                    const tr = target.closest('tr'); // Find the parent row if a TD is clicked
                    highlightRow(tr);
                }
            });
        })
        .catch(error => {
            console.error('Error loading company data:', error);
            alert('Failed to load company data.');
        });
    })
    .catch(error => {
        console.error('Error loading headers data:', error);
        alert('Failed to load header data.');
    });
}

function highlightRow(row) {
    const rows = document.querySelectorAll('#table-body tr');
    rows.forEach(r => {
        r.classList.remove('highlight-row');
        if (r.firstChild.firstChild.classList) {
            r.firstChild.firstChild.classList.remove('bold-text');
        }
    });

    row.classList.add('highlight-row');
    if (row.firstChild.firstChild.classList) {
        row.firstChild.firstChild.classList.add('bold-text');
    }
}




function updateCard(company, selectedGRI) {
    // Reference the tab-top-1 card directly
    const card = document.getElementById('tab-top-1');
    const cardTitle = card.querySelector('.card-title');
    const textContent = card.querySelector('.text-secondary');

    // Set the card title to the company name
    //cardTitle.textContent = company.name;

    // Set the content to the 'Text' data from the company metrics for the selected GRI standard
    textContent.innerHTML = (company.standards && company.standards.GRI && company.standards.GRI[selectedGRI] && company.standards.GRI[selectedGRI].metrics)
                            ? company.standards.GRI[selectedGRI].metrics['Text'] // Display the 'Text' from the metrics if available
                            : 'No details available for this standard.'; // Default text if not available

    // Change the tab's header to the company's name
    const firstTabLink = document.querySelector('a[href="#tab-top-1"]');
    if (firstTabLink) {
        firstTabLink.textContent = company.name;
    }


    const dataTab = document.getElementById('tab-top-2').querySelector('.text-secondary');
    dataTab.innerHTML = '';  // Clear previous content

    Object.keys(company.standards.GRI[selectedGRI]).forEach(key => {
        if (key.startsWith('attachment')) {
            let img = document.createElement('img');
            img.src = company.standards.GRI[selectedGRI][key];
            img.alt = "Relevant Attachment";
            img.style.width = '100%'; // Fit within the tab
            img.style.cursor = 'pointer'; // Indicate image is clickable
            img.classList.add('img-thumbnail'); // Bootstrap class for image styling

            img.addEventListener('click', function() {
                const modalImage = document.getElementById('modalImage');
                modalImage.src = img.src; // Set the modal image source to the clicked image source
                const modal = new bootstrap.Modal(document.getElementById('imageModal'));
                modal.show(); // Show the modal
            });

            dataTab.appendChild(img);
        }
    });



    // Programmatically click to ensure the tab shows updated content
    firstTabLink.click();
}


// Function to update the label of the first tab based on the clicked company name
function updateFirstTabLabel(companyName) {
    const firstTabLink = document.querySelector('a[href="#tab-top-1"]');
    if (firstTabLink) {
        firstTabLink.textContent = companyName;  // Update the text of the first tab
    }
}


function handleBadgeClick(selectedBadge) {
    // Reset all badges first
    const allBadges = document.querySelectorAll('.badge');
    allBadges.forEach(badge => {
        badge.classList.remove('bg-blue');
        badge.classList.add('bg-blue-lt');
    });

    // Highlight the clicked badge
    selectedBadge.classList.add('bg-blue');
    selectedBadge.classList.remove('bg-blue-lt');

    // Call to populate the table or handle other logic
    populateTable(selectedBadge.textContent);
    showExplainerCard(selectedBadge.textContent);
}
// Add this to set up your badges initially or when you dynamically create them
function setupBadges() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('click', () => handleBadgeClick(badge));
    });
}


document.addEventListener('DOMContentLoaded', function() {
    loadSubheadings(); // Load subheadings when the page loads
});

// Example to trigger table population manually for testing
populateTable("GRI 2-1"); // Adjust this as needed based on your actual use case



function updateFirstTabLabel(companyName) {
    const firstTabLink = document.querySelector('a[href="#tab-top-1"]');
    if (firstTabLink) {
        firstTabLink.textContent = companyName;
    }
}

