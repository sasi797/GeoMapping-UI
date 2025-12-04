import {
    Person,
    Email,
    Lock,
    Security,
    Phone,
    Home,
    CalendarMonth,
    Image,
    People
} from "@mui/icons-material";

export const VEHICLE_FORM_FIELDS = [
    {
        tab: "Account",
        sections: [
            {
                title: "Login Details",
                fields: [
                    { label: "Username", key: "username", type: "text", icon: Person, col: 6, color: "#f5f3ff" },   // lavender
                    { label: "Email", key: "email", type: "email", icon: Email, col: 6, color: "#f0f9ff" },        // light blue
                    { label: "Password", key: "password_hash", type: "password", icon: Lock, col: 6, color: "#fef9f9" }, // rose
                ],
            },
            {
                title: "Security",
                fields: [
                    { label: "Two-Factor Auth", key: "two_factor", type: "switch", icon: Security, col: 6, color: "#f9fef6" }, // mint
                    { label: "Recovery Email", key: "recovery_email", type: "email", icon: Email, col: 6, color: "#fffdf3" },  // cream
                ],
            },
        ],
    },
    {
        tab: "Personal Info",
        sections: [
            {
                title: "Basic Information",
                fields: [
                    { label: "First Name", key: "first_name", type: "text", icon: Person, col: 6, color: "#f3f9ff" },  // cyan
                    { label: "Last Name", key: "last_name", type: "text", icon: Person, col: 6, color: "#f5f3ff" },    // lavender
                    { label: "Date of Birth", key: "date_of_birth", type: "date", icon: CalendarMonth, col: 6, color: "#fef9f9" }, // rose
                    { label: "Profile Picture", key: "profile_picture", type: "file", icon: Image, col: 6, color: "#f0f9ff" }, // blue
                ],
            },
            {
                title: "Contact Info",
                fields: [
                    { label: "Phone Number", key: "phone", type: "text", icon: Phone, col: 6, color: "#fffdf3" },  // cream
                    { label: "Address", key: "address", type: "text", icon: Home, col: 12, color: "#f9fef6" },     // mint
                ],
            },
        ],
    },
    {
        tab: "Settings",
        sections: [
            {
                title: "Preferences",
                fields: [
                    { label: "Is Active", key: "is_active", type: "switch", icon: Security, col: 6, color: "#f3f9ff" }, // cyan
                    {
                        label: "Roles",
                        key: "roles",
                        type: "multiselect",
                        icon: People,
                        options: ["Admin", "Editor", "Viewer", "SuperAdmin"],
                        col: 12,
                        color: "#f5f3ff", // lavender
                    },
                ],
            },
        ],
    },
];
