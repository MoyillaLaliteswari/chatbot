import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { remark } from "remark";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import { ReactNode } from "react";
import { Message } from "../../types/messages";

/* ---------- Font ---------- */
Font.register({
  family: "NotoSansJP",
  src: "/fonts/NotoSansJP-Regular.ttf",
});

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    padding: 32,
    fontSize: 12,
    lineHeight: 1.6,
  },
  msgBlock: { marginBottom: 12 },
  user: { color: "#1d4ed8", marginBottom: 4 },
  assistant: { color: "#16a34a", marginBottom: 4 },
  paragraph: { marginBottom: 4 },
  bold: { fontWeight: "bold" },
  italic: { fontStyle: "italic" },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    textDecoration: "underline",
    marginTop: 10,
    marginBottom: 6,
    color: "#1e40af",
  },
  listItem: { marginLeft: 16, marginBottom: 4 },
  code: {
    fontFamily: "Courier",
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
});

/* ---------- Sanitiser ---------- */
/** Remove emoji & VS-16 and normalise punctuation so only glyphs
 *  present in NotoSansJP reach React-PDF. */
const sanitise = (s: string) =>
  s
    // 1️⃣ strip every pictographic emoji + skin-tone sequences + VS-16
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
    // 2️⃣ replace en/em dashes with ASCII hyphen
    .replace(/[–—]/g, "-")
    // 3️⃣ straight quotes
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'");

/* ---------- Markdown → React-PDF ---------- */
const parseMarkdown = (markdown: string): ReactNode[] => {
  const tree = remark().use(remarkParse).parse(sanitise(markdown));
  const elements: ReactNode[] = [];

  visit(tree, (node: any, _index: any, _parent: any) => {
    /* ───────── Heading (##) ───────── */
    if (node.type === "heading" && node.depth === 2) {
      const text = node.children.map((c: any) => c.value).join(" ");
      elements.push(
        <Text key={Math.random()} style={styles.heading}>
          {/* safe black square instead of 📘 */}
          ■ {text}
        </Text>
      );
    }

    /* ───────── Paragraph ───────── */
    if (node.type === "paragraph") {
      const line = node.children.map((child: any, i: number) => {
        if (child.type === "text") return child.value;
        if (child.type === "strong")
          return (
            <Text key={i} style={styles.bold}>
              {child.children[0].value}
            </Text>
          );
        if (child.type === "emphasis")
          return (
            <Text key={i} style={styles.italic}>
              {child.children[0].value}
            </Text>
          );
        return "";
      });

      elements.push(
        <Text key={Math.random()} style={styles.paragraph}>
          {line}
        </Text>
      );
    }

    /* ───────── List item ───────── */
    if (node.type === "listItem") {
      const content = node.children[0]?.children?.[0]?.value ?? "";
      elements.push(
        <Text key={Math.random()} style={styles.listItem}>
          • {content}
        </Text>
      );
    }

    /* ───────── Code block ───────── */
    if (node.type === "code") {
      elements.push(
        <Text key={Math.random()} style={styles.code}>
          {node.value}
        </Text>
      );
    }
  });

  return elements;
};

/* ---------- PDF component ---------- */
export const ChatHistoryPDF = ({ messages }: { messages: Message[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {messages.map((msg, idx) => {
        const sender =
          msg.role === "user"
            ? "User:"
            : msg.role === "assistant"
            ? "Assistant:"
            : "System:";

        return (
          <View key={idx} style={styles.msgBlock}>
            <Text
              style={
                msg.role === "assistant"
                  ? styles.assistant
                  : msg.role === "user"
                  ? styles.user
                  : styles.paragraph
              }
            >
              {sender}
            </Text>
            {parseMarkdown(msg.content)}
          </View>
        );
      })}
    </Page>
  </Document>
);
