import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { DocType, LetterData, ResumeData } from "@/lib/document-types";

type JobDocumentPdfProps = {
  activeTab: DocType;
  resumeData: ResumeData;
  letterData: LetterData;
  generatedDate: string;
  template?: 'classic' | 'modern' | 'minimal';
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 52,
    backgroundColor: "#ffffff",
    color: "#1e293b",
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.45,
  },
  resumeRoot: {
    gap: 14,
  },
  resumeHeader: {
    alignItems: "center",
    textAlign: "center",
    gap: 4,
  },
  resumeName: {
    fontFamily: "Times-Bold",
    fontSize: 20,
    color: "#0f172a",
  },
  contactLine: {
    color: "#475569",
    fontSize: 10.5,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingBottom: 2,
  },
  paragraph: {
    color: "#1e293b",
    textAlign: "justify",
  },
  skillList: {
    gap: 3,
  },
  skillRow: {
    flexDirection: "row",
  },
  skillLabel: {
    width: 84,
    fontFamily: "Times-Bold",
    textTransform: "capitalize",
  },
  skillValue: {
    flex: 1,
  },
  entryList: {
    gap: 10,
  },
  entryBlock: {
    gap: 3,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitle: {
    flex: 1,
    marginRight: 8,
    fontFamily: "Times-Bold",
    color: "#0f172a",
  },
  entryTitleSm: {
    flex: 1,
    marginRight: 8,
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: "#0f172a",
  },
  entryDate: {
    fontFamily: "Times-Italic",
    color: "#0f172a",
  },
  entryCompany: {
    color: "#0f172a",
  },
  bulletList: {
    gap: 2,
    marginTop: 1,
    paddingLeft: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletMark: {
    width: 10,
  },
  bulletText: {
    flex: 1,
    color: "#1e293b",
  },
  projectLink: {
    fontSize: 10,
    color: "#0f172a",
    textDecoration: "none",
  },
  educationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  educationSchool: {
    color: "#334155",
  },
  coverPage: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.6,
  },
  senderHeader: {
    alignItems: "flex-end",
    gap: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 18,
  },
  senderName: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    color: "#0f172a",
  },
  senderText: {
    color: "#475569",
  },
  senderDate: {
    marginTop: 6,
    color: "#94a3b8",
    fontFamily: "Times-Bold",
  },
  recipientBlock: {
    gap: 3,
  },
  recipientLabel: {
    marginBottom: 4,
    color: "#94a3b8",
    fontSize: 10,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  recipientName: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    color: "#0f172a",
  },
  recipientRole: {
    fontFamily: "Times-Italic",
    color: "#334155",
  },
  recipientCompany: {
    fontFamily: "Times-Bold",
    color: "#0f172a",
  },
  contentBlock: {
    flexGrow: 1,
    gap: 10,
  },
  signatureBlock: {
    paddingTop: 24,
    gap: 6,
  },
  signoff: {
    color: "#475569",
  },
  enclosure: {
    color: "#475569",
    fontFamily: "Times-Italic",
  },
});

function joinLine(parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" | ");
}

function ensureUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatSkillLabel(key: string) {
  return key.replace(/[-_]/g, " ");
}

function getLetterParagraphs(content: string) {
  const fallback =
    'Your personalized cover letter will appear here after clicking "AI Polish" or typing in the composer...';
  const source = content.trim() || fallback;

  return source
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function ResumePdf({ resumeData, template }: { resumeData: ResumeData; template: 'classic' | 'modern' | 'minimal' }) {
  const skillEntries = Object.entries(resumeData.skills).filter(([, value]) =>
    value.trim(),
  );

  const isSerif = template === 'classic';
  const isModern = template === 'modern';
  const fontFam = isSerif ? "Times-Roman" : "Helvetica";
  const fontFamBold = isSerif ? "Times-Bold" : "Helvetica-Bold";
  const fontFamItalic = isSerif ? "Times-Italic" : "Helvetica-Oblique";

  const tStyle = (style: any) => [style, { fontFamily: fontFam }];
  const tStyleBold = (style: any) => [style, { fontFamily: fontFamBold }];
  const tStyleItalic = (style: any) => [style, { fontFamily: fontFamItalic }];

  return (
    <View style={styles.resumeRoot}>
      <View style={[styles.resumeHeader, { alignItems: isSerif ? "center" : "flex-start", textAlign: isSerif ? "center" : "left" }]}>
        <Text style={[styles.resumeName, { fontFamily: fontFamBold }]}>{resumeData.fullName}</Text>
        <Text style={tStyle(styles.contactLine)}>
          {joinLine([resumeData.location, resumeData.email, resumeData.phone])}
        </Text>
        <Text style={tStyle(styles.contactLine)}>
          {joinLine([resumeData.github, resumeData.linkedin])}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { 
          fontFamily: fontFamBold, 
          color: isModern ? '#2563eb' : '#1e293b', 
          borderBottomColor: isModern ? '#2563eb' : '#1e293b' 
        }]}>Technical Summary</Text>
        <Text style={tStyle(styles.paragraph)}>{resumeData.summary}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { 
          fontFamily: fontFamBold, 
          color: isModern ? '#2563eb' : '#1e293b', 
          borderBottomColor: isModern ? '#2563eb' : '#1e293b' 
        }]}>Technical Skills</Text>
        <View style={styles.skillList}>
          {skillEntries.map(([key, value]) => (
            <View key={key} style={styles.skillRow}>
              <Text style={tStyleBold(styles.skillLabel)}>{formatSkillLabel(key)}:</Text>
              <Text style={tStyle(styles.skillValue)}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {resumeData.experience && resumeData.experience.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            fontFamily: fontFamBold, 
            color: isModern ? '#2563eb' : '#1e293b', 
            borderBottomColor: isModern ? '#2563eb' : '#1e293b' 
          }]}>Experience</Text>
          <View style={styles.entryList}>
            {resumeData.experience.map((exp, index) => (
              <View
                key={`${exp.title}-${index}`}
                style={styles.entryBlock}
                wrap={false}
              >
                <View style={styles.entryHeader}>
                  <Text style={tStyleBold(styles.entryTitle)}>{exp.title}</Text>
                  <Text style={tStyleItalic(styles.entryDate)}>{exp.date}</Text>
                </View>
                <Text style={tStyle(styles.entryCompany)}>{exp.company}</Text>
                <View style={styles.bulletList}>
                  {exp.bullets
                    .filter((bullet) => bullet.trim())
                    .map((bullet, bulletIndex) => (
                      <View
                        key={`${exp.title}-bullet-${bulletIndex}`}
                        style={styles.bulletRow}
                      >
                        <Text style={tStyle(styles.bulletMark)}>•</Text>
                        <Text style={tStyle(styles.bulletText)}>{bullet}</Text>
                      </View>
                    ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {resumeData.projects && resumeData.projects.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            fontFamily: fontFamBold, 
            color: isModern ? '#2563eb' : '#1e293b', 
            borderBottomColor: isModern ? '#2563eb' : '#1e293b' 
          }]}>Projects (Selected)</Text>
          <View style={styles.entryList}>
            {resumeData.projects.map((project, index) => (
              <View
                key={`${project.name}-${index}`}
                style={styles.entryBlock}
                wrap={false}
              >
                <Text style={tStyleBold(styles.entryTitleSm)}>{project.name}</Text>
                {project.link.trim() ? (
                  <Link src={ensureUrl(project.link)} style={tStyle(styles.projectLink)}>
                    {project.link}
                  </Link>
                ) : null}
                <View style={styles.bulletList}>
                  {project.bullets
                    .filter((bullet) => bullet.trim())
                    .map((bullet, bulletIndex) => (
                      <View
                        key={`${project.name}-bullet-${bulletIndex}`}
                        style={styles.bulletRow}
                      >
                        <Text style={tStyle(styles.bulletMark)}>•</Text>
                        <Text style={tStyle(styles.bulletText)}>{bullet}</Text>
                      </View>
                    ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {resumeData.education && resumeData.education.length > 0 ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            fontFamily: fontFamBold, 
            color: isModern ? '#2563eb' : '#1e293b', 
            borderBottomColor: isModern ? '#2563eb' : '#1e293b' 
          }]}>Education</Text>
          <View style={styles.entryList}>
            {resumeData.education.map((education, index) => (
              <View
                key={`${education.degree}-${index}`}
                style={styles.educationRow}
                wrap={false}
              >
                <View>
                  <Text style={tStyleBold(styles.entryTitleSm)}>{education.degree}</Text>
                  <Text style={tStyle(styles.educationSchool)}>{education.school}</Text>
                </View>
                <Text style={tStyleBold(styles.entryDate)}>{education.date}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CoverLetterPdf({
  generatedDate,
  letterData,
  resumeData,
  template,
}: {
  generatedDate: string;
  letterData: LetterData;
  resumeData: ResumeData;
  template: 'classic' | 'modern' | 'minimal';
}) {
  const paragraphs = getLetterParagraphs(letterData.content);

  const isSerif = template === 'classic';
  const isModern = template === 'modern';
  const fontFam = isSerif ? "Times-Roman" : "Helvetica";
  const fontFamBold = isSerif ? "Times-Bold" : "Helvetica-Bold";
  const fontFamItalic = isSerif ? "Times-Italic" : "Helvetica-Oblique";

  const tStyle = (style: any) => [style, { fontFamily: fontFam }];
  const tStyleBold = (style: any) => [style, { fontFamily: fontFamBold }];

  return (
    <View style={[styles.coverPage, { fontFamily: fontFam }]}>
      <View style={[styles.senderHeader, { 
        alignItems: isSerif ? "flex-end" : "flex-start",
        borderLeftWidth: isModern ? 4 : 0,
        borderLeftColor: '#2563eb',
        paddingLeft: isModern ? 12 : 0,
        borderBottomWidth: isSerif ? 1 : 0
      }]}>
        <Text style={[styles.senderName, { fontFamily: fontFamBold }]}>{resumeData.fullName}</Text>
        <Text style={tStyle(styles.senderText)}>{resumeData.location}</Text>
        <Text style={tStyle(styles.senderText)}>{resumeData.email}</Text>
        <Text style={tStyle(styles.senderText)}>{resumeData.phone}</Text>
        <Text style={[styles.senderDate, { fontFamily: fontFamBold }]}>{generatedDate}</Text>
      </View>

      <View style={styles.recipientBlock}>
        <Text style={[styles.recipientLabel, { fontFamily: fontFamBold }]}>Recipient Details</Text>
        {letterData.recipient ? <Text style={[styles.recipientName, { fontFamily: fontFamBold }]}>{letterData.recipient}</Text> : null}
        {letterData.role ? <Text style={[styles.recipientRole, { fontFamily: fontFamItalic }]}>{letterData.role}</Text> : null}
        {letterData.company && !/confidential|n\/?a|none|not specified|walang company/i.test(letterData.company) ? (
          <Text style={[styles.recipientCompany, { fontFamily: fontFamBold }]}>{letterData.company}</Text>
        ) : null}
      </View>

      <View style={styles.contentBlock}>
        {paragraphs.map((paragraph, index) => (
          <Text key={`paragraph-${index}`} style={tStyle(styles.paragraph)}>
            {paragraph}
          </Text>
        ))}
      </View>

      <View style={[styles.signatureBlock, { alignItems: isSerif ? "flex-end" : "flex-start" }]}>
        <Text style={tStyle(styles.signoff)}>Best Regards,</Text>
        <Text style={[styles.recipientName, { fontFamily: fontFamBold }]}>{resumeData.fullName}</Text>
        <Text style={[styles.enclosure, { fontFamily: fontFamItalic }]}>Enclosure: Resume</Text>
      </View>
    </View>
  );
}

export function JobDocumentPdf({
  activeTab,
  generatedDate,
  letterData,
  resumeData,
  template = 'classic',
}: JobDocumentPdfProps) {
  const title =
    activeTab === "resume"
      ? `${resumeData.fullName} Resume`
      : `${resumeData.fullName} Cover Letter`;

  return (
    <Document author={resumeData.fullName} creator="JobScoutAI" title={title}>
      <Page size="LETTER" style={styles.page}>
        {activeTab === "resume" ? (
          <ResumePdf resumeData={resumeData} template={template} />
        ) : (
          <CoverLetterPdf
            generatedDate={generatedDate}
            letterData={letterData}
            resumeData={resumeData}
            template={template}
          />
        )}
      </Page>
    </Document>
  );
}
