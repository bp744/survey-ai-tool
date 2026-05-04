"use server";
import mammoth from 'mammoth';

export async function parseSurveyDoc(formData) {
    const file = formData.get("file");
    if (!file) return { error: "No file uploaded" };
    
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // mammoth is excellent for .docx files
        const result = await mammoth.extractRawText({ buffer: buffer });
        const text = result.value; 
        
        if (!text || text.trim().length < 5) {
            throw new Error("Document appears to be empty.");
        }

        return { text };
    } catch (e) {
        console.error("Mammoth Error:", e);
        return { error: "Failed to read document content. Please try a different .docx file." };
    }
}