"use client";
import { useState } from "react";
import {
  Grid,
  Tabs,
  Tab,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import CustomInput from "./form-fields/CustomInput";
import CustomSelect from "./form-fields/CustomSelect";
import CustomMultiSelect from "./form-fields/CustomMultiSelect";
import CustomFileUpload from "./form-fields/CustomFileUpload";
import CustomSwitch from "./form-fields/CustomSwitch";
import CustomTextarea from "./form-fields/CustomTextArea";
import CustomNumber from "./form-fields/CustomNumber";

const fieldComponents = {
  text: CustomInput,
  textarea: CustomTextarea,
  number: CustomNumber,
  email: CustomInput,
  password: CustomInput,
  date: CustomInput,
  select: CustomSelect,
  multiselect: CustomMultiSelect,
  file: CustomFileUpload,
  switch: CustomSwitch,
};

const CustomForm = ({ formSchema, formData, onChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  const validateField = (field, value) => {
    const { rules = {}, label } = field;

    if (field.required && (value === "" || value === null || value === undefined)) {
      return `${label} is required`;
    }

    if (rules.minLength && value?.length < Number(rules.minLength)) {
      return `${label} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value?.length > Number(rules.maxLength)) {
      return `${label} must be less than ${rules.maxLength} characters`;
    }

    if (rules.min && Number(value) < Number(rules.min)) {
      return `${label} must be greater than or equal to ${rules.min}`;
    }

    if (rules.max && Number(value) > Number(rules.max)) {
      return `${label} must be less than or equal to ${rules.max}`;
    }

    if (rules.pattern) {
      try {
        const regex = new RegExp(rules.pattern);
        if (value && !regex.test(value)) {
          return `${label} format is invalid`;
        }
      } catch (e) {
        console.warn(`Invalid regex pattern for ${label}:`, rules.pattern);
      }
    }

    return ""; // ✅ no error
  };


  return (
    <div>
      {/* Tabs with icons */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          background: "#fafafa",
          mb: 1,
          mt: 2,
          "& .MuiTab-root": {
            fontWeight: 600,
            textTransform: "none",
            fontSize: "0.95rem",
            minHeight: "44px",
          },
          "& .Mui-selected": { color: "#7e5bef" },
          "& .MuiTabs-indicator": {
            height: "3px",
            borderRadius: "3px",
            background: "linear-gradient(to right, #7e5bef, #00c6ff)",
          },
        }}
      >
        {formSchema.map((tab, idx) => (
          <Tab
            key={idx}
            icon={tab.icon ? <tab.icon fontSize="small" /> : null}
            iconPosition="start"
            label={tab.tab}
          />
        ))}
      </Tabs>

      {/* Sections */}
      {formSchema[activeTab]?.sections.map((section, sIdx) => (
        <Accordion
          key={sIdx}
          defaultExpanded
          disableGutters
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
            overflow: "hidden",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon fontSize="small" />}
            sx={{
              background: "linear-gradient(to right, #7e5bef08, #00c6ff08)",
              px: 2,
              py: 1,
              minHeight: "40px !important",
              "& .MuiAccordionSummary-content": {
                margin: 0,
                alignItems: "center",
                gap: 1,
              },
            }}
          >
            {section.icon && <section.icon fontSize="small" />}
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {section.title}
            </Typography>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* ✅ Sort by fieldorder before rendering */}
              {section.fields
                ?.sort((a, b) => (a.fieldorder || 0) - (b.fieldorder || 0))
                .map((field, idx) => {
                  const FieldComponent = fieldComponents[field.type];
                  if (!FieldComponent) return null;

                  // ✅ Remov6 key from spread props
                  const { key, ...safeFieldProps } = field;

                  return (
                    <Grid
                      item
                      key={field.key || idx}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        minWidth:
                          field.type === "select" || field.type === "multiselect"
                            ? 200
                            : "auto",
                      }}
                    >
                      <FieldComponent
                        {...safeFieldProps}
                        name={field.key}
                        value={formData[field.key]}
                        onChange={onChange}
                        error={validateField(field, formData[field.key])}
                      />
                    </Grid>
                  );
                })}

            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default CustomForm;
