<template>
    <div>
        <header class="header">
            <img src="../assets/logo.png" alt="Logo" class="logo" @click="goToDashboard">
            <button class="logout-button" @click="logout">Logout</button>
        </header>
        <div class="header-container">
            <h2>MY APPLICATIONS</h2>
            <button class="add-application-button" @click="toggleForm">+</button>
        </div>
        <div class="add-form" v-if="showForm">
            <form @submit.prevent="editMode ? saveApplication() : addApplication()">
                <label for="company">Company:</label>
                <input type="text" id="company" v-model="formApplication.company" required>
                <label for="jobTitle">Job Title:</label>
                <input type="text" id="jobTitle" v-model="formApplication.jobTitle" required>
                <label for="dateApplied">Date Applied:</label>
                <input type="date" id="dateApplied" v-model="formApplication.dateApplied" required>
                <label for="status">Status:</label>
                <select id="status" v-model="formApplication.status">
                    <option>Applied</option>
                    <option>Interview Scheduled</option>
                    <option>Interview Completed</option>
                    <option>Offer Pending</option>
                    <option>Rejected</option>
                </select>
                <label for="link">Job Link:</label>
                <input type="url" id="link" v-model="formApplication.link">
                <button class="submit-btn" type="submit">{{ editMode ? 'Save' : 'Submit' }}</button>
            </form>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="company-column">COMPANY</th>
                        <th class="job-title-column">JOB TITLE</th>
                        <th class="date-applied-column">DATE APPLIED</th>
                        <th class="status-column">STATUS</th>
                        <th class="link-column">LINK</th>
                        <th class="dropdown"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="application in applications" :key="application._id">
                        <td class="company-column">{{ application.company }}</td>
                        <td class="job-title-column">{{ application.jobTitle }}</td>
                        <td class="date-applied-column">{{ formatDateFromDB(application.dateApplied) }}</td>
                        <td class="status-column">
                            <span class="status-pill" :class="application.status.toLowerCase().replace(' ', '-')">
                                {{ application.status }}
                            </span>
                        </td>
                        <td class="link-column"><a :href="application.link" target="_blank">Indeed.com</a></td>
                        <td class="dropdown">
                            <button class="dropbtn">⋮</button>
                                <div class="dropdown-content">
                                    <a @click="editApplication(application)">Edit</a>
                                    <a @click="deleteApplication(application._id)">Delete</a>
                                </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            applications: [],
            newApplication: {
                company: "",
                jobTitle: "",
                dateApplied: "",
                status: "Applied",
                link: ""
            },
            showForm: false,
            editMode: false,
            currentApplication: null,
            submitted: false
        };
    },
    computed: {
        formApplication: {
            get() {
                return this.editMode ? this.currentApplication : this.newApplication;
            },
            set(value) {
                if (this.editMode) {
                    this.currentApplication = value;
                } else {
                    this.newApplication = value;
                }
            }
        }
    },
    methods: {
        async fetchJobs() {
            try {
                const response = await fetch("/api/applications", {
                    credentials: 'include' 
                });
                const data = await response.json();
                this.applications = data.map(application => {
                    application.dateApplied = this.formatDateToInput(application.dateApplied);
                    return application;
                });
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        },
        formatDateFromDB(date) {
            return new Date(date).toLocaleDateString();
        },
        formatDateToDB(date) {
            const [year, month, day] = date.split('-');
            const formattedDate = new Date(`${year}-${month}-${day}T12:00:00Z`);
            return formattedDate.toISOString();
        },
        formatDateToInput(date) {
            const d = new Date(date);
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const year = d.getFullYear();
            return `${year}-${month}-${day}`;
        },
        toggleForm() {
            this.showForm = !this.showForm;
            this.editMode = false;
            this.currentApplication = null;
        },
        async addApplication() {
            try {
                this.newApplication.dateApplied = this.formatDateToDB(this.newApplication.dateApplied);
                const response = await fetch("/api/applications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.newApplication),
                    credentials: 'include' 
                });

                if (response.ok) {
                    this.fetchJobs();
                    this.newApplication = { company: "", jobTitle: "", dateApplied: "", status: "Applied", link: "" };
                    this.showForm = false;
                }
            } catch (error) {
                console.error("Error adding application:", error);
            }
        },
        editApplication(application) {
            this.currentApplication = { ...application };
            this.currentApplication.dateApplied = this.formatDateToInput(this.currentApplication.dateApplied);
            this.showForm = true;
            this.editMode = true;
        },
        async saveApplication() {
            try {
                this.currentApplication.dateApplied = this.formatDateToDB(this.currentApplication.dateApplied);
                const response = await fetch(`/api/applications/${this.currentApplication._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(this.currentApplication),
                    credentials: 'include' 
                });

                if (response.ok) {
                    this.fetchJobs();
                    this.currentApplication = null;
                    this.showForm = false;
                    this.editMode = false;
                }
            } catch (error) {
                console.error("Error saving application:", error);
            }
        },
        async deleteApplication(applicationId) {
            try {
                const response = await fetch(`/api/applications/${applicationId}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    credentials: 'include' 
                });

                if (response.ok) {
                    this.fetchJobs();
                }
            } catch (error) {
                console.error("Error deleting application:", error);
            }
        },
        async logout() {
            try {
                const response = await fetch('/api/users/logout', {
                    method: 'POST',
                    credentials: 'include' 
                });
                const data = await response.json();
                if (data.success) {
                    //alert('Logout successful!');
                    this.$router.push('/login');
                } else {
                    //alert('Logout failed: ' + data.message);
                }
            } catch (error) {
                console.error('Error logging out:', error);
            }
        },
        goToDashboard() {
            this.$router.push('/dashboard');
        }
    },
    mounted() {
        this.fetchJobs();
    }
};
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
}

.logo {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 100px;
    height: auto;
    cursor: pointer;
}

.logout-button {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 10px;
    background-color: #1C2222;
    color: #D7F4F4;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

.logout-button:hover {
    background-color: #D7F4F4;
    color: #1C2222;
  }

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 60px 65px 0 65px; 
}

h2 {
    margin: 0;
}

.add-application-button {
    background-color: #D7F4F4;
    font-size: 1.5em;
    color: #1C2222;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}

.table-container {
    margin-top: 20px;
    padding: 0 65px;
}

table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #ddd;
    border-width: 30px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
    background-color: #D7F4F4;
}

th, td {
    padding: 12px 8px;
    text-align: left;
    border-bottom: 0.5px solid #1C2222;
}


th {
    font-weight: bold;
}

.company-column {
    width: 25%;
}

.job-title-column {
    width: 30%;
}

.date-applied-column {
    width: 25%;
}

.status-column {
    width: 20%;
}

.link-column {
    width: 15%;
}

.status-pill {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    text-align: center;
}

.applied { background-color: #91D4D4; color: #1C2222; }
.interview-scheduled { background-color: #70C2C2; color: #1C2222; }
.interview-completed { background-color: #51B1B1; color: #1C2222; }
.offer-pending { background-color: #2E9E9E; color: #1C2222; }
.rejected { background-color: #0D8C8C; color: #1C2222; }

a {
    color: #1C2222;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.dropbtn {
    background: none;
    border: none;
    font-size: 1.5em;
    cursor: pointer;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
}

.dropdown-content a {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.dropdown-content a:hover {
    background-color: #f1f1f1;
}

.dropdown:hover .dropdown-content {
    display: block;
}

.add-form  {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

.add-form label {
    font-weight: bold;
    margin-bottom: 5px;
    padding: 10px;
}
.add-form input,
.add-form select {
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  border: transparent;
  background-color: #D7F4F4;
}


.submit-btn {
  background-color: #1C2222; 
  color: #D7F4F4;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
}

.submit-btn:hover {
  background-color: black; 
}


</style>