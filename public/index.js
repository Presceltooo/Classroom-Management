document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('studentForm');
    const membersTable = document.getElementById('membersTable').getElementsByTagName('tbody')[0];
    const downloadCSVButton = document.getElementById('downloadCSV');
    let members = [];
    let editIndex = -1;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const studentID = document.getElementById('studentID').value;
        const name = document.getElementById('name').value;
        const sex = document.getElementById('sex').value;
        const birthDate = document.getElementById('birthDate').value;

        // Additional validation
        if (!/^\d+$/.test(studentID)) {
            alert('Student ID must be numeric.');
            return;
        }
        if (!/^[A-Za-z\s]+$/.test(name)) {
            alert('Name must contain only letters and spaces.');
            return;
        }

        const birthDateObj = new Date(birthDate);
        const today = new Date();
        const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
        if (birthDateObj > today) {
            alert('Birth Date cannot be in the future.');
            return;
        }
        if (birthDateObj < minDate) {
            alert('Birth Date cannot be more than 120 years in the past.');
            return;
        }

        const member = { studentID, name, sex, birthDate };

        if (editIndex === -1) {
            fetch('/add-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(member)
            }).then(() => fetchMembers());
        } else {
            fetch('/edit-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(member)
            }).then(() => {
                editIndex = -1;
                fetchMembers();
            });
        }

        form.reset();
    });

    function fetchMembers() {
        fetch('/students')
            .then(response => response.json())
            .then(data => {
                members = data;
                updateTable();
            });
    }

    function formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    }

    function updateTable() {
        membersTable.innerHTML = '';
        members.forEach((member, index) => {
            const row = membersTable.insertRow();
            row.insertCell(0).innerText = member.studentID;
            row.insertCell(1).innerText = member.name;
            row.insertCell(2).innerText = member.sex;
            row.insertCell(3).innerText = formatDate(member.birthDate);
            const actionsCell = row.insertCell(4);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-sm';
            deleteButton.innerText = 'Delete';
            deleteButton.addEventListener('click', () => {
                fetch('/delete-student', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ studentID: member.studentID })
                }).then(() => fetchMembers());
            });
            actionsCell.appendChild(deleteButton);

            const editButton = document.createElement('button');
            editButton.className = 'btn btn-warning btn-sm ml-2';
            editButton.innerText = 'Edit';
            editButton.addEventListener('click', () => {
                document.getElementById('studentID').value = member.studentID;
                document.getElementById('name').value = member.name;
                document.getElementById('sex').value = member.sex;
                document.getElementById('birthDate').value = member.birthDate;
                editIndex = index;
            });
            actionsCell.appendChild(editButton);
        });
    }

    downloadCSVButton.addEventListener('click', () => {
        fetch('/students')
            .then(response => response.json())
            .then(members => {
                const csvContent = "\uFEFF" + "Student ID,Name,Sex,Birth Date\n" 
                    + members.map(m => `${m.studentID},${m.name},${m.sex},${formatDate(m.birthDate)}`).join("\n");
                const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
                const link = document.createElement('a');
                link.setAttribute('href', encodedUri);
                link.setAttribute('download', 'class_members.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
    });

    fetchMembers();
});