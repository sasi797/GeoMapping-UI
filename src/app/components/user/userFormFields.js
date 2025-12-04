import {
  Person,
  Email,
  Lock,
  Security,
  CalendarMonth,
  AccessTime,
  Key,
  People,
} from "@mui/icons-material";

export const USER_FORM_FIELDS = [
  {
    tab: "User Details",
    sections: [
      {
        title: "Basic Information",
        fields: [
          {
            label: "Username",
            key: "username",
            type: "text",
            icon: Person,
            col: 6,
          },
          {
            label: "Full Name",
            key: "full_name",
            type: "text",
            icon: Person,
            col: 6,
          },
          {
            label: "Email",
            key: "email",
            type: "email",
            icon: Email,
            col: 6,
          },
          {
            label: "Password",
            key: "password_hash",
            type: "password",
            icon: Lock,
            col: 6,
          },
        ],
      },
    ],
  },
  {
    tab: "Access & Role",
    sections: [
      {
        title: "Permissions",
        fields: [
          {
            label: "Role",
            key: "role",
            type: "select",
            icon: People,
            options: ["Admin", "Manager", "User", "Viewer"],
            col: 6,
          },
          {
            label: "Is Active",
            key: "is_active",
            type: "switch",
            icon: Security,
            col: 6,
          },
        ],
      },
    ],
  },
];
