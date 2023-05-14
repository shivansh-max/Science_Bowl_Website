const PDFParser = require('pdf-parse');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const pdfFilePath = './round1.pdf';
const csvFilePath = './output.csv';

// Function to extract text from the PDF file
const extractTextFromPDF = async (filePath) => {
  const pdfBuffer = fs.readFileSync(filePath);

  try {
    const pdfData = await PDFParser(pdfBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return null;
  }
};

// Function to write data to CSV file
const writeToCsv = (data, filePath) => {
  const csvWriter = createCsvWriter({
    path: filePath,
    header: [
      { id: 'round', title: 'Round' },
      { id: 'questionType', title: 'Question Type' },
      { id: 'questionNumber', title: 'Question Number' },
      { id: 'subject', title: 'Subject' },
      { id: 'question', title: 'Question' },
      { id: 'answer', title: 'Answer' }
    ]
  });

  csvWriter
    .writeRecords(data)
    .then(() => console.log('CSV file has been created successfully.'))
    .catch((error) => console.error('Error writing to CSV:', error));
};

// Main function to extract text and write to CSV
const convertPdfToCsv = async () => {
  const text = await extractTextFromPDF(pdfFilePath);

  // Parse the extracted text into question-answer pairs
  const lines = text.split('\n');
  const data = [];
  let currentQuestion = null;
  let round = '';
  let questionType = '';

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith('ROUND ')) {
      // Identify the round
      round = line;
    } else if (line.startsWith('TOSS-UP') || line.startsWith('BONUS')) {
      // Identify the question type
      questionType = line;
    } else if (line.match(/^\d+\)/)) {
      // New question encountered
      const questionNumber = line.match(/^\d+/)[0];
      const subject = line.substring(line.indexOf(')') + 1).trim();

      // Extract the question and answer
      const questionIndex = line.indexOf(')') + 1;
      const answerIndex = line.indexOf('ANSWER:');
      const question = line.substring(questionIndex, answerIndex).trim();
      const answer = line.substring(answerIndex + 7).trim();

      currentQuestion = {
        round,
        questionType,
        questionNumber,
        subject,
        question,
        answer
      };
      data.push(currentQuestion);
      currentQuestion = null;
    }
  }

  // Write the extracted data to a CSV file
  writeToCsv(data, csvFilePath);
};

// Call the main function
convertPdfToCsv();
