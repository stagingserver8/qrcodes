document.addEventListener('DOMContentLoaded', function() {
    // Set up card titles based on initially selected item
    const selectedItem = document.querySelector('input[name="item"]:checked').value;
    updateCardTitles(selectedItem);

    // Set up event listeners for badges and standards selections
    attachListenersToItemsAndStandards();

    // Set up badges for interaction
    setupBadges();

    // Load sub options for the default selected standard, 'GRI' in this case
    updateSubOptions('GRI');

    document.getElementById('dynamicHeading').textContent = "Dane Organizacji";

    
     // Load GRI 2-1 by default
     selectDefaultGRI();


});




function selectDefaultGRI() {
    const defaultGRI = "GRI 2-1";
    populateTable(defaultGRI);
    showExplainerCard(defaultGRI);

    // Optionally, update the UI to reflect that GRI 2-1 is selected
    highlightDefaultSelection(defaultGRI);
}

function highlightDefaultSelection(defaultGRI) {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        if (item.textContent.trim() === defaultGRI) {
            item.classList.add('active'); // Assuming 'active' is your class for highlighting
            document.getElementById('dynamicHeading').innerText = item.textContent;  // Set the heading to show GRI 2-1
        } else {
            item.classList.remove('active');
        }
    });
}



// Global variable to keep track of the last clicked company
let lastClickedCompany = null;






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

function updateBadgeEventListeners(container) {
    const badges = container.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('click', () => handleBadgeClick(badge));
    });
}

function handleBadgeClick(badge) {
    // Clear previous selections
    const allBadges = document.querySelectorAll('.badge');
    allBadges.forEach(b => {
        b.classList.remove('bg-blue');
        b.classList.add('bg-blue-lt');
    });

    // Highlight the clicked badge
    badge.classList.add('bg-blue');
    badge.classList.remove('bg-blue-lt');

    // Get the badge name, assuming the badge's text content is the identifier
    const badgeName = badge.textContent.trim();

    // Update the <h3> element's text to the name of the clicked badge
    document.getElementById('dynamicHeading').textContent = badgeName;

    // Update content in tabs and explainer card
    updateTabContent(badgeName);
    showExplainerCard(badgeName);
}



function setupBadges() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        badge.addEventListener('click', function() {
            handleBadgeClick(badge);
        });
    });
}




  

// Add this to set up your badges initially or when you dynamically create them
function setupBadges() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        // Assuming `data-gri-item` is an attribute containing the target GRI item
        badge.addEventListener('click', function() {
            handleBadgeClick(badge, badge.getAttribute('data-gri-item'));
        });
    });
}

function updateSubOptions(selectedStandard) {
    fetch('standards.json')
    .then(response => response.json())
    .then(data => {
        const subOptions = data[selectedStandard] || [];
        const container = document.getElementById('subOptionsContainer');
        container.innerHTML = ''; // Clear existing content

        let lastHeader = null;
        subOptions.forEach(option => {
            if (lastHeader !== option.header) {
                const headerItem = document.createElement('li');
                headerItem.className = 'dropdown-header';
                headerItem.textContent = option.header;
                container.appendChild(headerItem);
                lastHeader = option.header; // Update lastHeader to current
            }
            container.appendChild(createDropdownItem(option.name, option.short_explainer)); // Include short explainer if needed
        });
    })
    .catch(error => console.error('Error loading standard data:', error));
}

function createDropdownItem(text, short_explainer) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'dropdown-item';
    link.href = '#';
    link.textContent = text;
    link.title = short_explainer;  // Tooltip showing short explainer
    link.onclick = () => {
        populateTable(text);  // Optional based on whether you need to repopulate the table
        updateTabContent(text);  // Updates the content in the tabs
        showExplainerCard(text);  // Updates the explainer card
        document.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
        link.classList.add('active');
    };
    item.appendChild(link);
    return item;
}

function updateTabContent(selectedGRI) {
    fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        // Assuming "Bank Gospodarstwa Krajowego" is the company you want to display data for
        const companyData = data.find(company => company.name === "Bank Gospodarstwa Krajowego");
        if (!companyData || !companyData.standards || !companyData.standards.GRI || !companyData.standards.GRI[selectedGRI]) {
            console.log('No data found for:', selectedGRI);
            return; // If no data found, exit the function
        }

        const metrics = companyData.standards.GRI[selectedGRI].metrics;
        const card1 = document.getElementById('tab-top-1').querySelector('.text-secondary');
        const card2 = document.getElementById('tab-top-2').querySelector('.text-secondary');

        // Update the text in Tab 1 using innerHTML to parse HTML tags
        card1.innerHTML = metrics.Text || 'No details available.';

        // Clear previous attachments in Tab 2 and update new ones
        card2.innerHTML = ''; // Clear previous content
        Object.keys(companyData.standards.GRI[selectedGRI]).forEach(key => {
            if (key.startsWith('attachment')) {
                let img = document.createElement('img');
                img.src = companyData.standards.GRI[selectedGRI][key];
                img.alt = "Relevant Attachment";
                img.style.width = '100%'; // Fit within the tab
                img.classList.add('img-thumbnail');
                card2.appendChild(img);
            }
        });
    })
    .catch(error => {
        console.error('Error loading company data:', error);
    });
}



function populateTable(optionText) {
    // Function to populate a table or handle other logic based on the selected option
    console.log('Populating table with data related to:', optionText);
}



function showExplainerCard(optionText) {
    // Function to display detailed information about the selected option
    console.log('Showing explainer card for:', optionText);
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
    // Clear previous selections
    const allBadges = document.querySelectorAll('.badge');
    allBadges.forEach(b => {
        b.classList.remove('bg-blue');
        b.classList.add('bg-blue-lt');
    });

    // Highlight the clicked badge
    badge.classList.add('bg-blue');
    badge.classList.remove('bg-blue-lt');

    // Get the badge name, assuming the badge's text content is the identifier
    const badgeName = badge.textContent.trim();

    // Update the <h3> element's text and the content in the tabs
    document.getElementById('dynamicHeading').textContent = badgeName;
    updateTabContent(badgeName); // Make sure this is the correct key as expected by your JSON structure
    showExplainerCard(badgeName);
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
                    if (content === "Pełny" || content === "Cześćiowy" || content === "Brak") {
                        const span = document.createElement('span');
                        span.className = 'status-circle';
                        span.style.display = 'inline-block';
                        span.style.width = '10px';
                        span.style.height = '10px';
                        span.style.borderRadius = '50%';
                        span.style.marginRight = '5px';

                        switch (content) {
                            case "Pełny":
                                span.style.backgroundColor = '#2fb344'; // Green
                                break;
                            case "Cześćiowy":
                                span.style.backgroundColor = '#f59f00'; // Yellow
                                break;
                            case "Brak":
                                span.style.backgroundColor = '#d63939'; // Red
                                break;
                        }
                        td.appendChild(span);
                        //td.appendChild(document.createTextNode(content)); // Optional: show text beside the circle
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

document.addEventListener('DOMContentLoaded', function () {
    const dropdownContainer = document.getElementById('subOptionsContainer');

    // Pre-fetch standards data and store it
    fetch('standards.json')
    .then(response => response.json())
    .then(standards => {
        attachDropdownListener(standards.GRI);  // Attach listener with pre-fetched standards
    })
    .catch(error => console.error('Failed to load standards:', error));
});

function attachDropdownListener(standards) {
    const dropdownContainer = document.getElementById('subOptionsContainer');
    const dropdownButton = document.getElementById('subOptionsDropdown');

    dropdownContainer.addEventListener('click', function(event) {
        if (event.target.tagName === 'A') {  
            const selectedText = event.target.textContent;
            const shortExplainer = getShortExplainer(standards, selectedText);
            document.getElementById('dynamicHeading').innerText = shortExplainer;  
            dropdownButton.textContent = selectedText;  
            event.preventDefault();
        }
    });
}

function getShortExplainer(standards, selectedText) {
    // Find the matching standard and return its short_explainer
    const standard = standards.find(s => s.name === selectedText);
    return standard ? standard.short_explainer : 'No explainer available';
}





$(document).ready(function() {
    // Populate dropdown from JSON
    Object.keys(titles).forEach(function(key) {
        $('#subOptionsContainer').append(`<li><a class="dropdown-item" href="#" data-key="${key}">${key}</a></li>`);
    });

    // Bind click event to dropdown items
    $(document).on('click', '.dropdown-item', function(e) {
        e.preventDefault();
        const selectedKey = $(this).data('key');
        $('#dynamicHeading').text(titles[selectedKey]);
    });
});


