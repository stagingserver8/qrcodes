document.addEventListener('DOMContentLoaded', function() {
    const selectedItem = document.querySelector('input[name="item"]:checked').value;
    updateCardTitles(selectedItem);
    attachListenersToItemsAndStandards();
    populateTable();  // Ensure the table is populated when the document is ready
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

async function updateSubOptions(selectedStandard) {
    try {
        const response = await fetch('standards.json');
        const data = await response.json();
        const subOptions = data[selectedStandard] || [];

        const container = document.getElementById('subOptionsContainer');
        container.innerHTML = ''; // Clear existing content

        subOptions.forEach(option => {
            container.appendChild(createBadge(option.name)); // Assume each option has a 'name' property
        });

        updateBadgeEventListeners(container);
    } catch (error) {
        console.error('Error loading standard data:', error);
        // Handle errors, e.g., display a message or log to console
    }
}


function createBadge(text) {
    const badge = document.createElement('span');
    badge.className = 'badge bg-blue-lt cursor-pointer';
    badge.textContent = text;
    badge.onclick = () => handleBadgeClick(badge);
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

function showExplainerCard(title) {
    const explainerCard = document.getElementById('explainerCard');
    explainerCard.style.display = 'block'; // Show the card
    explainerCard.querySelector('.card-title').textContent = `Explainer of ${title}`; // Set the title
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
        badge.onclick = () => handleBadgeClick(badge);
    });
}

function attachListenersToItemsAndStandards() {
    document.querySelectorAll('input[name="item"], input[name="esgStandard"]').forEach(input => {
        input.onchange = () => {
            input.name === 'item' ? updateCardTitles(input.value) : updateSubOptions(input.value);
        };
    });
}







// TABLE STUFF /// 
function populateTable() {
    fetch('companies.json')
    .then(response => response.json())
    .then(data => {
        const headings = ["Country", "Heading 1", "Heading 2", "Heading 3", "Heading 4"];
        const tableHeadings = document.getElementById('table-headings');
        tableHeadings.innerHTML = ''; // Clear existing headings
        headings.forEach(heading => {
            const th = document.createElement('th');
            th.className = 'text-nowrap';
            th.textContent = heading;
            tableHeadings.appendChild(th);
        });

        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear existing rows
        data.forEach(company => {
            const tr = document.createElement('tr');
            tr.className = 'table-row'; // Added class for easier selection later
            const th = document.createElement('th');
            const link = document.createElement('a');
            link.href = "#";
            link.className = "company-name";
            link.dataset.company = company.name;
            link.textContent = company.name;
            link.addEventListener('click', function(event) {
                event.preventDefault();
                updateFirstTabLabel(this.textContent); // Update the first tab's label when clicked
                highlightRow(tr); // Call function to highlight the row
            });
            th.appendChild(link);
            tr.appendChild(th);

            // Country column
            const tdCountry = document.createElement('td');
            tdCountry.textContent = company.country || "-";
            tr.appendChild(tdCountry);

            // Additional data columns
            ["Heading 1", "Heading 2", "Heading 3"].forEach(heading => {
                const td = document.createElement('td');
                td.textContent = company.data[heading] || "-"; // Use data from the company object or default to "-"
                tr.appendChild(td);
            });

            tableBody.appendChild(tr);
        });
    })
    .catch(error => console.error('Error loading company data:', error));
}




function highlightRow(selectedRow) {
    const rows = document.querySelectorAll('.table-row');
    rows.forEach(row => {
        row.classList.remove('highlight'); // Remove highlight from all rows
    });
    selectedRow.classList.add('highlight'); // Add highlight to the selected row
}

function updateFirstTabLabel(companyName) {
    const firstTabLink = document.querySelector('a[href="#tab-top-1"]');
    if (firstTabLink) {
        firstTabLink.textContent = companyName;
    }
}


