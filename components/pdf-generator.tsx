interface StudentData {
  name?: string
  fname?: string
  mname?: string
  roll?: string
  reg?: string
  inst?: string
  group?: string
  gpa?: string
  table?: Array<{
    name: string
    code: string
    grade: string
    point: string
  }>
  centre?: string
}

interface ExamData {
  roll: string
  reg: string
  board: string
  exam: string
  year: string
}

interface PDFData {
  studentData: StudentData
  examData: ExamData
}

// Convert Bengali subject names to English
const convertToEnglishSubject = (bengaliName: string) => {
  const subjectMap: { [key: string]: string } = {
    বাংলা: "BENGALI",
    ইংরেজি: "ENGLISH",
    গণিত: "MATHEMATICS",
    পদার্থবিজ্ঞান: "PHYSICS",
    রসায়ন: "CHEMISTRY",
    জীববিজ্ঞান: "BIOLOGY",
    "উচ্চতর গণিত": "HIGHER MATHEMATICS",
    "তথ্য ও যোগাযোগ প্রযুক্তি": "INFORMATION & COMMUNICATION TECHNOLOGY",
    "সাধারণ বিজ্ঞান": "GENERAL SCIENCE",
    "সামাজিক বিজ্ঞান": "SOCIAL SCIENCE",
    ধর্ম: "RELIGION",
    "ইসলাম ধর্ম": "ISLAMIC STUDIES",
    "হিন্দু ধর্ম": "HINDU RELIGION",
    "খ্রিস্ট ধর্ম": "CHRISTIANITY",
    "বৌদ্ধ ধর্ম": "BUDDHISM",
  }
  return subjectMap[bengaliName] || bengaliName.toUpperCase()
}

// Get board name in English
const getBoardNameEnglish = (code: string) => {
  const boards: { [key: string]: string } = {
    dhaka: "DHAKA",
    barisal: "BARISAL",
    chittagong: "CHITTAGONG",
    comilla: "COMILLA",
    dinajpur: "DINAJPUR",
    jessore: "JESSORE",
    mymensingh: "MYMENSINGH",
    rajshahi: "RAJSHAHI",
    sylhet: "SYLHET",
    madrasah: "MADRASAH",
    technical: "TECHNICAL",
    dibs: "DIBS",
  }
  return boards[code] || code.toUpperCase()
}

// Get exam name in English
const getExamNameEnglish = (code: string) => {
  const exams: { [key: string]: string } = {
    ssc: "Secondary School Certificate",
    hsc: "Higher Secondary Certificate",
    jsc: "Junior School Certificate",
    dibs: "Diploma in Business Studies",
  }
  return exams[code] || code.toUpperCase()
}

// Generate a unique serial number
const generateSerialNumber = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString()
}

// Generate a unique GBTSL number
const generateGBTSLNumber = () => {
  return "G" + Math.floor(1000000 + Math.random() * 9000000).toString()
}

export async function generatePDF(data: PDFData) {
  try {
    const { studentData, examData } = data

    // Import jsPDF dynamically
    const { jsPDF } = await import("jspdf")

    // Create a new jsPDF instance with better settings
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      putOnlyUsedFonts: true,
      compress: true,
    })

    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height

    // Set cream/off-white background like the original
    doc.setFillColor(254, 254, 250) // Very light cream
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // Create decorative border pattern like the original
    // Outer decorative border
    doc.setDrawColor(70, 130, 180) // Steel blue color
    doc.setLineWidth(1.5)

    // Draw ornate border pattern
    for (let i = 0; i < 4; i++) {
      doc.rect(3 + i * 0.5, 3 + i * 0.5, pageWidth - 6 - i, pageHeight - 6 - i)
    }

    // Inner content border
    doc.setDrawColor(100, 100, 100)
    doc.setLineWidth(0.8)
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24)

    // Generate serial numbers
    const serialNumber = generateSerialNumber()
    const gbtslNumber = generateGBTSLNumber()

    // === HEADER SECTION ===
    // Board logo placeholder (circular)
    const logoX = 25
    const logoY = 20
    const logoRadius = 12

    doc.setFillColor(0, 106, 78) // Bangladesh green
    doc.circle(logoX, logoY, logoRadius, "F")
    doc.setDrawColor(255, 215, 0) // Gold border
    doc.setLineWidth(1)
    doc.circle(logoX, logoY, logoRadius, "S")

    // Logo text
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.text("BD", logoX, logoY + 2, { align: "center" })

    // Main header text
    doc.setTextColor(100, 100, 100) // Dark gray like original
    doc.setFont("times", "bold")
    doc.setFontSize(13)

    const boardName = `BOARD OF INTERMEDIATE AND SECONDARY EDUCATION, ${getBoardNameEnglish(examData.board)}`
    doc.text(boardName, pageWidth / 2, 22, { align: "center" })

    doc.setFontSize(11)
    doc.text("BANGLADESH", pageWidth / 2, 29, { align: "center" })

    // Exam title with background
    doc.setFillColor(240, 240, 240)
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    const examTitleWidth = 80
    const examTitleX = (pageWidth - examTitleWidth) / 2
    doc.rect(examTitleX, 32, examTitleWidth, 8, "FD")

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`${getExamNameEnglish(examData.exam)} Examination - ${examData.year}`, pageWidth / 2, 37, {
      align: "center",
    })

    // === SERIAL NUMBERS AND ACADEMIC TRANSCRIPT ===
    doc.setFont("times", "normal")
    doc.setFontSize(9)
    doc.text(`Serial No. CGB: ${serialNumber}`, 20, 50)

    // Academic Transcript title with black background
    doc.setFillColor(0, 0, 0)
    const transcriptWidth = 60
    const transcriptX = (pageWidth - transcriptWidth) / 2
    doc.rect(transcriptX, 45, transcriptWidth, 8, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFont("times", "bold")
    doc.setFontSize(11)
    doc.text("ACADEMIC TRANSCRIPT", pageWidth / 2, 50, { align: "center" })

    doc.setTextColor(0, 0, 0)
    doc.setFont("times", "normal")
    doc.setFontSize(8)
    doc.text(`GBTSL No.: ${gbtslNumber}`, 20, 57)

    // === GRADING SCALE TABLE (Top Right) ===
    const gradeTableX = 145
    const gradeTableY = 45
    const gradeCellWidth = 18
    const gradeCellHeight = 5

    // Grade table border
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.8)
    doc.rect(gradeTableX, gradeTableY, gradeCellWidth * 3, gradeCellHeight * 8)

    // Grade table headers with gray background
    doc.setFillColor(220, 220, 220)
    doc.rect(gradeTableX, gradeTableY, gradeCellWidth, gradeCellHeight, "FD")
    doc.rect(gradeTableX + gradeCellWidth, gradeTableY, gradeCellWidth, gradeCellHeight, "FD")
    doc.rect(gradeTableX + gradeCellWidth * 2, gradeTableY, gradeCellWidth, gradeCellHeight, "FD")

    doc.setFont("times", "bold")
    doc.setFontSize(7)
    doc.text("Letter", gradeTableX + gradeCellWidth / 2, gradeTableY + 2, { align: "center" })
    doc.text("Grade", gradeTableX + gradeCellWidth / 2, gradeTableY + 3.5, { align: "center" })
    doc.text("Class", gradeTableX + gradeCellWidth + gradeCellWidth / 2, gradeTableY + 2, { align: "center" })
    doc.text("Interval", gradeTableX + gradeCellWidth + gradeCellWidth / 2, gradeTableY + 3.5, { align: "center" })
    doc.text("Grade", gradeTableX + gradeCellWidth * 2 + gradeCellWidth / 2, gradeTableY + 2, { align: "center" })
    doc.text("Point", gradeTableX + gradeCellWidth * 2 + gradeCellWidth / 2, gradeTableY + 3.5, { align: "center" })

    // Grade data
    const grades = [
      ["A+", "80-100", "5.00"],
      ["A", "70-79", "4.00"],
      ["A-", "60-69", "3.50"],
      ["B", "50-59", "3.00"],
      ["C", "40-49", "2.00"],
      ["D", "33-39", "1.00"],
      ["F", "00-32", "0.00"],
    ]

    doc.setFont("times", "normal")
    doc.setFontSize(7)
    grades.forEach((grade, index) => {
      const y = gradeTableY + gradeCellHeight + index * gradeCellHeight

      // Alternating row colors
      if (index % 2 === 1) {
        doc.setFillColor(248, 248, 248)
        doc.rect(gradeTableX, y, gradeCellWidth * 3, gradeCellHeight, "F")
      }

      // Cell borders
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.3)
      doc.rect(gradeTableX, y, gradeCellWidth, gradeCellHeight)
      doc.rect(gradeTableX + gradeCellWidth, y, gradeCellWidth, gradeCellHeight)
      doc.rect(gradeTableX + gradeCellWidth * 2, y, gradeCellWidth, gradeCellHeight)

      doc.text(grade[0], gradeTableX + gradeCellWidth / 2, y + 3.5, { align: "center" })
      doc.text(grade[1], gradeTableX + gradeCellWidth + gradeCellWidth / 2, y + 3.5, { align: "center" })
      doc.text(grade[2], gradeTableX + gradeCellWidth * 2 + gradeCellWidth / 2, y + 3.5, { align: "center" })
    })

    // === STUDENT INFORMATION SECTION ===
    const infoStartY = 70
    const labelX = 20
    const colonX = 70
    const valueX = 75
    const lineHeight = 7

    doc.setFont("times", "bold")
    doc.setFontSize(10)

    // Student details with proper formatting
    const studentInfo = [
      ["Name of Student", studentData.name || "Nabami Mojumder"],
      ["Father's Name", studentData.fname || "Narayan Mojumder"],
      ["Mother's Name", studentData.mname || "Suchitra Mojumder"],
      ["Name of Centre", studentData.centre || "Ramgarh(271)"],
      ["Name of Institution", studentData.inst || "Ramgarh Degree College(3275)"],
    ]

    studentInfo.forEach((info, index) => {
      const y = infoStartY + index * lineHeight
      doc.setFont("times", "bold")
      doc.setFontSize(9)
      doc.text(info[0], labelX, y)
      doc.setFont("times", "normal")
      doc.text(":", colonX, y)
      doc.setFont("times", "italic")
      doc.text(info[1], valueX, y)
    })

    // Roll and Registration on same line
    const rollRegY = infoStartY + studentInfo.length * lineHeight
    doc.setFont("times", "bold")
    doc.setFontSize(9)
    doc.text("Roll No.", labelX, rollRegY)
    doc.setFont("times", "normal")
    doc.text(":", colonX, rollRegY)
    doc.text(examData.roll, valueX, rollRegY)

    doc.setFont("times", "bold")
    doc.text("Registration No.", labelX + 90, rollRegY)
    doc.setFont("times", "normal")
    doc.text(":", labelX + 140, rollRegY)
    doc.text(examData.reg, labelX + 145, rollRegY)

    // Group and Type of Student
    const groupTypeY = rollRegY + lineHeight
    doc.setFont("times", "bold")
    doc.text("Group", labelX, groupTypeY)
    doc.setFont("times", "normal")
    doc.text(":", colonX, groupTypeY)
    doc.setFont("times", "italic")
    doc.text(studentData.group || "Science", valueX, groupTypeY)

    doc.setFont("times", "bold")
    doc.text("Type of Student", labelX + 90, groupTypeY)
    doc.setFont("times", "normal")
    doc.text(":", labelX + 140, groupTypeY)
    doc.setFont("times", "italic")
    doc.text("Regular", labelX + 145, groupTypeY)

    // === SUBJECTS TABLE ===
    const tableStartY = groupTypeY + 12

    // Table structure matching the original
    const colWidths = [18, 85, 28, 28, 35, 25]
    const colX = [20, 38, 123, 151, 179, 214]
    const rowHeight = 8
    const headerHeight = 12

    // Table border
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1)
    const tableWidth = colWidths.reduce((sum, width) => sum + width, 0)

    // Header background
    doc.setFillColor(240, 240, 240)
    doc.rect(colX[0], tableStartY, tableWidth, headerHeight, "FD")

    // Header text
    doc.setFont("times", "bold")
    doc.setFontSize(8)
    doc.text("Sl. No.", colX[0] + colWidths[0] / 2, tableStartY + 4, { align: "center" })
    doc.text("Name of Subjects", colX[1] + colWidths[1] / 2, tableStartY + 4, { align: "center" })
    doc.text("Letter Grade", colX[2] + colWidths[2] / 2, tableStartY + 4, { align: "center" })
    doc.text("Grade Point", colX[3] + colWidths[3] / 2, tableStartY + 4, { align: "center" })

    // Split GPA headers
    doc.text("GPA", colX[4] + colWidths[4] / 2, tableStartY + 3, { align: "center" })
    doc.setFontSize(6)
    doc.text("(without additional subject)", colX[4] + colWidths[4] / 2, tableStartY + 7, { align: "center" })
    doc.setFontSize(8)
    doc.text("GPA", colX[5] + colWidths[5] / 2, tableStartY + 4, { align: "center" })

    // Draw header cell borders
    colX.forEach((x, i) => {
      doc.setLineWidth(0.5)
      doc.rect(x, tableStartY, colWidths[i], headerHeight)
    })

    // Table data
    const subjects = studentData.table || []
    const mainSubjects = subjects.slice(0, 5)

    doc.setFont("times", "normal")
    doc.setFontSize(9)

    mainSubjects.forEach((subject, index) => {
      const rowY = tableStartY + headerHeight + index * rowHeight

      // Alternating row colors
      if (index % 2 === 1) {
        doc.setFillColor(252, 252, 252)
        doc.rect(colX[0], rowY, tableWidth, rowHeight, "F")
      }

      // Draw cell borders
      colX.forEach((x, i) => {
        doc.setLineWidth(0.3)
        doc.rect(x, rowY, colWidths[i], rowHeight)
      })

      // Fill data
      doc.text((index + 1).toString(), colX[0] + colWidths[0] / 2, rowY + 5, { align: "center" })
      doc.setFont("times", "bold")
      doc.text(convertToEnglishSubject(subject.name), colX[1] + 2, rowY + 5)
      doc.setFont("times", "normal")
      doc.text(subject.grade, colX[2] + colWidths[2] / 2, rowY + 5, { align: "center" })
      doc.text(subject.point, colX[3] + colWidths[3] / 2, rowY + 5, { align: "center" })

      // GPA in middle rows (row 2, index 2)
      if (index === 2) {
        doc.setFillColor(240, 248, 255) // Light blue background for GPA
        doc.rect(colX[4], rowY, colWidths[4], rowHeight, "F")
        doc.rect(colX[5], rowY, colWidths[5], rowHeight, "F")

        doc.setFont("times", "bold")
        doc.setFontSize(11)
        doc.text(studentData.gpa || "3.60", colX[4] + colWidths[4] / 2, rowY + 5, { align: "center" })
        doc.text(studentData.gpa || "4.00", colX[5] + colWidths[5] / 2, rowY + 5, { align: "center" })
        doc.setFont("times", "normal")
        doc.setFontSize(9)
      }
    })

    // Additional subject if exists
    if (subjects.length > 5) {
      const additionalY = tableStartY + headerHeight + mainSubjects.length * rowHeight + 8

      doc.setFont("times", "bold")
      doc.setFontSize(9)
      doc.text("Additional Subject :", 20, additionalY)

      const addSubject = subjects[5]
      const addRowY = additionalY + 5

      // Additional subject row with light background
      doc.setFillColor(255, 248, 220) // Light yellow
      doc.rect(colX[0], addRowY, tableWidth, rowHeight, "FD")

      // Draw borders
      colX.forEach((x, i) => {
        doc.setLineWidth(0.3)
        doc.rect(x, addRowY, colWidths[i], rowHeight)
      })

      doc.setFont("times", "normal")
      doc.text("6", colX[0] + colWidths[0] / 2, addRowY + 5, { align: "center" })
      doc.setFont("times", "bold")
      doc.text(convertToEnglishSubject(addSubject.name), colX[1] + 2, addRowY + 5)
      doc.setFont("times", "normal")
      doc.text(addSubject.grade, colX[2] + colWidths[2] / 2, addRowY + 5, { align: "center" })
      doc.text(addSubject.point, colX[3] + colWidths[3] / 2, addRowY + 5, { align: "center" })

      doc.setFont("times", "bold")
      doc.setFontSize(7)
      doc.text("GP Above 2", colX[4] + colWidths[4] / 2, addRowY + 3, { align: "center" })
      doc.setFontSize(9)
      doc.text("2.00", colX[4] + colWidths[4] / 2, addRowY + 7, { align: "center" })
    }

    // === FOOTER SECTION ===
    const footerY = pageHeight - 45

    // Date of publication
    doc.setFont("times", "italic")
    doc.setFontSize(9)
    doc.text(
      `Date of Publication of Result : ${new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}`,
      20,
      footerY,
    )

    // Controller signature area
    doc.setFont("times", "normal")
    doc.setFontSize(9)
    doc.text("Controller of Examinations", 150, footerY + 15)

    // Signature line
    doc.setLineWidth(0.5)
    doc.line(150, footerY + 10, 190, footerY + 10)

    // Note at bottom
    doc.setFont("times", "normal")
    doc.setFontSize(7)
    const noteText =
      "Note : Benefit of additional subject is given to the candidates of the sessions 2002-2003, 2003-2004, 2004-2005 & 2005-2006."
    doc.text(noteText, 20, footerY + 25, { maxWidth: 170 })

    // Generate filename
    const studentName = studentData.name ? studentData.name.replace(/\s+/g, "_") : "Student"
    const filename = `${studentName}_${examData.exam.toUpperCase()}_Transcript_${examData.year}.pdf`

    // Save the PDF
    doc.save(filename)
  } catch (error) {
    console.error("PDF Generation Error:", error)
    throw new Error("PDF তৈরি করতে সমস্যা হয়েছে")
  }
}
