  // // import React, { useEffect, useState, useRef } from "react";
  // // import axios from "axios";
  // // import "bootstrap/dist/css/bootstrap.min.css";
  // // import "./NoteUpload.css"; // Move your custom styles here

  // // function NotesUpload() {
  // //   const [file, setFile] = useState(null);
  // //   const [progress, setProgress] = useState([]);
  // //   const [quizQuestions, setQuizQuestions] = useState([]);
  // //   const [userAnswers, setUserAnswers] = useState({});
  // //   const [result, setResult] = useState(null);
  // //   const [explanations, setExplanations] = useState([]);
  // //   const [currentNoteId, setCurrentNoteId] = useState(null);
  // //   const [isLoading, setIsLoading] = useState(false);
  // //   const [error, setError] = useState(null);
  // //   const [success, setSuccess] = useState(null);
  // //   const [deleteConfirm, setDeleteConfirm] = useState(null);
  // //   const [expandedNote, setExpandedNote] = useState(null); // Track expanded note details
  // //   const [topicSummaries, setTopicSummaries] = useState([]); // Store topic summaries
  // //   const [noteFlashcards, setNoteFlashcards] = useState([]); // Store flashcards

  // //   const token = localStorage.getItem("token");
  // //   const headers = { Authorization: `Token ${token}` };
  // //   const fileInputRef = useRef(null);

  // //   useEffect(() => {
  // //     fetchProgress();
  // //     // eslint-disable-next-line
  // //   }, []);

  // //   const fetchProgress = async () => {
  // //     setIsLoading(true);
  // //     setError(null);
  // //     try {
  // //       const res = await axios.get("/api/notes/progress/", { headers });
  // //       setProgress(res.data);
  // //     } catch (error) {
  // //       console.error("Error fetching progress:", error);
  // //       setError("Failed to load your notes. Please try again later.");
  // //     } finally {
  // //       setIsLoading(false);
  // //     }
  // //   };

  // //   const handleUpload = async () => {
  // //     if (!file) {
  // //       setError("Please select a file first");
  // //       return;
  // //     }

  // //     setIsLoading(true);
  // //     setError(null);
  // //     setSuccess(null);
      
  // //     const formData = new FormData();
  // //     formData.append("file", file);

  // //     try {
  // //       const response = await axios.post("/api/notes/upload/", formData, { headers });
  // //       setSuccess("Notes uploaded successfully!");
  // //       setFile(null);
        
  // //       // Store generated content for display
  // //       setTopicSummaries(response.data.topics || []);
  // //       setNoteFlashcards(response.data.flashcards || []);
        
  // //       fetchProgress();
  // //     } catch (error) {
  // //       console.error("Upload failed:", error);
  // //       setError(
  // //         error.response?.data?.error || 
  // //         "Upload failed. Only PDF, DOCX, and TXT files are supported."
  // //       );
  // //     } finally {
  // //       setIsLoading(false);
  // //     }
  // //   };

  // //   const handleDeleteNote = async (noteId) => {
  // //     if (window.confirm("Are you sure you want to delete this note and all its related content?")) {
  // //       setIsLoading(true);
  // //       setError(null);
  // //       try {
  // //         await axios.delete(`/api/notes/delete/${noteId}/`, { headers });
  // //         setSuccess("Note deleted successfully!");
  // //         fetchProgress();
          
  // //         // Reset quiz if deleted note was active
  // //         if (currentNoteId === noteId) {
  // //           setQuizQuestions([]);
  // //           setCurrentNoteId(null);
  // //           setResult(null);
  // //           setExplanations([]);
  // //         }
          
  // //         // Reset content previews
  // //         if (expandedNote === noteId) {
  // //           setExpandedNote(null);
  // //           setTopicSummaries([]);
  // //           setNoteFlashcards([]);
  // //         }
  // //       } catch (error) {
  // //         console.error("Delete failed:", error);
  // //         setError("Failed to delete note. Please try again.");
  // //       } finally {
  // //         setIsLoading(false);
  // //       }
  // //     }
  // //   };

  // //   const fetchQuiz = async (noteId) => {
  // //     setIsLoading(true);
  // //     setError(null);
  // //     try {
  // //       const res = await axios.get(`/api/notes/quiz/${noteId}/retake/`, { headers });
  // //       setQuizQuestions(res.data);
  // //       setCurrentNoteId(noteId);
  // //       setResult(null);
  // //       setExplanations([]);
  // //       setUserAnswers({});
  // //       setDeleteConfirm(null); // Close any open delete confirmation
  // //     } catch (error) {
  // //       console.error("Error loading quiz:", error);
  // //       setError("Failed to load quiz questions. Please try again.");
  // //     } finally {
  // //       setIsLoading(false);
  // //     }
  // //   };

  // //   const toggleNoteExpansion = (noteId) => {
  // //     if (expandedNote === noteId) {
  // //       setExpandedNote(null);
  // //       setTopicSummaries([]);
  // //       setNoteFlashcards([]);
  // //     } else {
  // //       setExpandedNote(noteId);
        
  // //       // Find the note and set its content
  // //       const note = progress.find(n => n.id === noteId);
  // //       if (note) {
  // //         setTopicSummaries(note.topics || []);
  // //         setNoteFlashcards(note.flashcards || []);
  // //       }
  // //     }
  // //   };

  // //   const handleOptionChange = (index, optionKey) => {
  // //     setUserAnswers((prev) => ({ ...prev, [index]: optionKey }));
  // //   };

  // //   const submitQuiz = async () => {
  // //     if (!currentNoteId) {
  // //       setError("No quiz selected");
  // //       return;
  // //     }
      
  // //     if (Object.keys(userAnswers).length !== quizQuestions.length) {
  // //       setError("Please answer all questions before submitting");
  // //       return;
  // //     }

  // //     setIsLoading(true);
  // //     setError(null);
      
  // //     try {
  // //       const res = await axios.post(
  // //         `/api/notes/${currentNoteId}/submit-quiz/`,
  // //         { answers: userAnswers },
  // //         { headers }
  // //       );
  // //       setResult(res.data.score);
  // //       setExplanations(res.data.explanations);
  // //     } catch (error) {
  // //       console.error("Error submitting quiz:", error);
  // //       setError("Quiz submission failed. Please try again.");
  // //     } finally {
  // //       setIsLoading(false);
  // //     }
  // //   };

  // //   return (
  // //     <div className="container my-5">
  // //       <div className="text-center mb-5">
  // //         <h2 className="fw-bold text-primary">
  // //           <i className="bi bi-journal-bookmark me-2"></i>
  // //           Upload Notes & Test Your Knowledge
  // //         </h2>
  // //         <p className="text-muted">
  // //           Upload your study materials and test your understanding with AI-generated quizzes
  // //         </p>
  // //       </div>

  // //       {/* File Upload Section */}
  // //       <div className="card shadow mb-5 border-0">
  // //         <div className="card-header bg-primary text-white">
  // //           <h5 className="mb-0">
  // //             <i className="bi bi-upload me-2"></i>
  // //             Upload Notes
  // //           </h5>
  // //         </div>
  // //         <div className="card-body">
  // //           <div className="row align-items-center">
  // //             <div className="col-md-8 mb-3 mb-md-0">
  // //               <div className="input-group">
  // //                 <input
  // //                   ref={fileInputRef}
  // //                   type="file"
  // //                   className="form-control"
  // //                   accept=".pdf,.docx,.txt"
  // //                   onChange={(e) => setFile(e.target.files[0])}
  // //                 />
  // //                 <button
  // //                   className="btn btn-outline-secondary"
  // //                   type="button"
  // //                   onClick={() => fileInputRef.current && fileInputRef.current.click()}
  // //                 >
  // //                   Browse
  // //                 </button>
  // //               </div>
  // //               <div className="form-text">
  // //                 Supported formats: PDF, DOCX, TXT (Max 5MB)
  // //               </div>
  // //               {file && (
  // //                 <div className="mt-2">
  // //                   <span className="badge bg-info">
  // //                     <i className="bi bi-file-earmark-text me-1"></i>
  // //                     {file.name}
  // //                   </span>
  // //                 </div>
  // //               )}
  // //             </div>
  // //             <div className="col-md-4">
  // //               <button 
  // //                 onClick={handleUpload} 
  // //                 className="btn btn-primary w-100"
  // //                 disabled={isLoading || !file}
  // //               >
  // //                 {isLoading ? (
  // //                   <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
  // //                 ) : (
  // //                   <i className="bi bi-upload me-2"></i>
  // //                 )}
  // //                 Upload Notes
  // //               </button>
  // //             </div>
  // //           </div>

  // //           {/* Status Messages */}
  // //           {error && (
  // //             <div className="alert alert-danger mt-3 mb-0">
  // //               <i className="bi bi-exclamation-circle me-2"></i>
  // //               {error}
  // //             </div>
  // //           )}
  // //           {success && (
  // //             <div className="alert alert-success mt-3 mb-0">
  // //               <i className="bi bi-check-circle me-2"></i>
  // //               {success}
  // //             </div>
  // //           )}
  // //         </div>
  // //       </div>

  // //       {/* Uploaded Notes Section */}
  // //       <div className="card shadow mb-5 border-0">
  // //         <div className="card-header bg-info text-white">
  // //           <h5 className="mb-0">
  // //             <i className="bi bi-journal-bookmark me-2"></i>
  // //             Your Uploaded Notes
  // //           </h5>
  // //         </div>
  // //         <div className="card-body">
  // //           {isLoading ? (
  // //             <div className="text-center py-4">
  // //               <div className="spinner-border text-primary" role="status">
  // //                 <span className="visually-hidden">Loading...</span>
  // //               </div>
  // //               <p className="mt-2">Loading your notes...</p>
  // //             </div>
  // //           ) : progress.length === 0 ? (
  // //             <div className="text-center py-4">
  // //               <i className="bi bi-journal-bookmark text-muted mb-3" style={{ fontSize: "3rem" }}></i>
  // //               <h5>No notes uploaded yet</h5>
  // //               <p className="text-muted">Upload your first set of notes to get started</p>
  // //             </div>
  // //           ) : (
  // //             <div className="list-group">
  // //               {progress.map((note) => (
  // //                 <div 
  // //                   key={note.id} 
  // //                   className="list-group-item position-relative"
  // //                 >
  // //                   <div className="d-flex justify-content-between align-items-center">
  // //                     <div>
  // //                       <h6 className="mb-1">{note.title}</h6>
  // //                       <small className="text-muted">
  // //                         Uploaded: {new Date(note.created_at).toLocaleDateString()}
  // //                       </small>
  // //                     </div>
                      
  // //                     <div>
  // //                       <button
  // //                         className="btn btn-sm btn-outline-primary me-2"
  // //                         onClick={() => toggleNoteExpansion(note.id)}
  // //                       >
  // //                         <i className={`bi bi-${expandedNote === note.id ? 'dash' : 'plus'}-circle me-1`}></i>
  // //                         {expandedNote === note.id ? 'Collapse' : 'Details'}
  // //                       </button>
                        
  // //                       <button
  // //                         className="btn btn-sm btn-outline-success me-2"
  // //                         onClick={() => fetchQuiz(note.id)}
  // //                         disabled={isLoading}
  // //                       >
  // //                         <i className="bi bi-arrow-repeat me-1"></i>
  // //                         Quiz
  // //                       </button>
                        
  // //                       <button
  // //                         className="btn btn-sm btn-outline-danger"
  // //                         onClick={() => setDeleteConfirm(deleteConfirm === note.id ? null : note.id)}
  // //                         disabled={isLoading}
  // //                       >
  // //                         <i className="bi bi-trash me-1"></i>
  // //                         Delete
  // //                       </button>
  // //                     </div>
  // //                   </div>
                    
  // //                   {/* Expanded Note Content */}
  // //                   {expandedNote === note.id && (
  // //                     <div className="mt-3">
  // //                       <div className="border-top pt-3">
  // //                         <h5 className="text-primary mb-3">
  // //                           <i className="bi bi-lightbulb me-2"></i>
  // //                           AI-Generated Content
  // //                         </h5>
                          
  // //                         {/* Topic Summaries */}
  // //                         <div className="mb-4">
  // //                           <h6 className="d-flex align-items-center text-info">
  // //                             <i className="bi bi-journal-text me-2"></i>
  // //                             Topic Summaries
  // //                           </h6>
  // //                           <div className="row">
  // //                             {topicSummaries.map((topic, index) => (
  // //                               <div key={index} className="col-md-6 mb-3">
  // //                                 <div className="card h-100 border-info">
  // //                                   <div className="card-header bg-info text-white py-2">
  // //                                     <small className="fw-bold">{topic.topic}</small>
  // //                                   </div>
  // //                                   <div className="card-body p-3">
  // //                                     <p className="card-text">{topic.summary}</p>
  // //                                   </div>
  // //                                 </div>
  // //                               </div>
  // //                             ))}
  // //                           </div>
  // //                         </div>
                          
  // //                         {/* Flashcards */}
  // //                         <div>
  // //                           <h6 className="d-flex align-items-center text-info">
  // //                             <i className="bi bi-card-text me-2"></i>
  // //                             Key Concepts
  // //                           </h6>
  // //                           <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
  // //                             {noteFlashcards.map((flashcard, index) => (
  // //                               <div key={index} className="col">
  // //                                 <div className="card h-100 border-warning flashcard">
  // //                                   <div className="card-header bg-warning text-dark py-2">
  // //                                     <small className="fw-bold">Flashcard {index + 1}</small>
  // //                                   </div>
  // //                                 <div className="card-body p-3">
  // //                                   <h6 className="card-title text-primary">{flashcard.term}</h6>
  // //                                   <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
  // //                                     {flashcard.definition || "No definition available"}
  // //                                   </p>
  // //                                       </div>

  // //                                 </div>
  // //                               </div>
  // //                             ))}
  // //                           </div>
  // //                         </div>
  // //                       </div>
  // //                     </div>
  // //                   )}
                    
  // //                   {/* Delete confirmation */}
  // //                   {deleteConfirm === note.id && (
  // //                     <div className="mt-3 p-3 bg-light rounded border">
  // //                       <div className="d-flex justify-content-between align-items-center">
  // //                         <p className="mb-0">Are you sure you want to delete this note?</p>
  // //                         <div>
  // //                           <button
  // //                             className="btn btn-sm btn-outline-secondary me-2"
  // //                             onClick={() => setDeleteConfirm(null)}
  // //                           >
  // //                             Cancel
  // //                           </button>
  // //                           <button
  // //                             className="btn btn-sm btn-danger"
  // //                             onClick={() => handleDeleteNote(note.id)}
  // //                             disabled={isLoading}
  // //                           >
  // //                             {isLoading ? (
  // //                               <span className="spinner-border spinner-border-sm" role="status"></span>
  // //                             ) : (
  // //                               "Confirm Delete"
  // //                             )}
  // //                           </button>
  // //                         </div>
  // //                       </div>
  // //                     </div>
  // //                   )}
  // //                 </div>
  // //               ))}
  // //             </div>
  // //           )}
  // //         </div>
  // //       </div>

  // //       {/* Quiz Section */}
  // //       {quizQuestions.length > 0 && (
  // //         <div className="card shadow mb-5 border-0">
  // //           <div className="card-header bg-warning text-dark">
  // //             <div className="d-flex justify-content-between align-items-center">
  // //               <h5 className="mb-0">
  // //                 <i className="bi bi-question-circle me-2"></i>
  // //                 Quiz Time!
  // //               </h5>
  // //               <span className="badge bg-dark">
  // //                 {quizQuestions.length} Questions
  // //               </span>
  // //             </div>
  // //           </div>
  // //           <div className="card-body">
  // //             <div className="alert alert-info mb-4">
  // //               <i className="bi bi-lightbulb me-2"></i>
  // //               Answer all questions to test your understanding of the material
  // //             </div>

  // //             {quizQuestions.map((q, index) => (
  // //               <div key={index} className="card mb-4 border-primary quiz-question">
  // //                 <div className="card-header bg-light d-flex justify-content-between">
  // //                   <h5 className="mb-0">Question {index + 1}</h5>
  // //                   <span className="badge bg-secondary">{q.difficulty}</span>
  // //                 </div>
  // //                 <div className="card-body">
  // //                   <h5 className="card-title">{q.question}</h5>
  // //                   <div className="mt-3">
  // //                     {Object.entries(q.options).map(([key, value]) => (
  // //                       <div className="form-check mb-2" key={key}>
  // //                         <input
  // //                           className="form-check-input"
  // //                           type="radio"
  // //                           name={`question-${index}`}
  // //                           id={`option-${index}-${key}`}
  // //                           checked={userAnswers[index] === key}
  // //                           onChange={() => handleOptionChange(index, key)}
  // //                         />
  // //                         <label 
  // //                           className="form-check-label w-100 p-2 rounded" 
  // //                           htmlFor={`option-${index}-${key}`}
  // //                           style={{
  // //                             backgroundColor: userAnswers[index] === key ? '#e6f7ff' : 'transparent',
  // //                             transition: 'background-color 0.2s'
  // //                           }}
  // //                         >
  // //                           <span className="fw-bold me-2">{key.toUpperCase()}.</span> 
  // //                           {value}
  // //                         </label>
  // //                       </div>
  // //                     ))}
  // //                   </div>
  // //                 </div>
  // //               </div>
  // //             ))}

  // //             <div className="d-flex justify-content-between align-items-center mt-4">
  // //               <button
  // //                 className="btn btn-outline-secondary"
  // //                 onClick={() => {
  // //                   setQuizQuestions([]);
  // //                   setCurrentNoteId(null);
  // //                 }}
  // //                 disabled={isLoading}
  // //               >
  // //                 Cancel Quiz
  // //               </button>
  // //               <button
  // //                 className="btn btn-success"
  // //                 onClick={submitQuiz}
  // //                 disabled={isLoading}
  // //               >
  // //                 {isLoading ? (
  // //                   <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
  // //                 ) : (
  // //                   <i className="bi bi-check-circle me-2"></i>
  // //                 )}
  // //                 Submit Quiz
  // //               </button>
  // //             </div>
  // //           </div>
  // //         </div>
  // //       )}

  // //       {/* Quiz Results */}
  // //       {result !== null && (
  // //         <div className="card shadow mb-5 border-0">
  // //           <div className="card-header bg-success text-white">
  // //             <div className="d-flex justify-content-between align-items-center">
  // //               <h5 className="mb-0">
  // //                 <i className="bi bi-graph-up me-2"></i>
  // //                 Quiz Results
  // //               </h5>
  // //               <span className="badge bg-light text-dark">
  // //                 {quizQuestions.length} Questions
  // //               </span>
  // //             </div>
  // //           </div>
  // //           <div className="card-body">
  // //             <div className="text-center mb-4">
  // //               <div className="result-circle mx-auto mb-3" style={{
  // //                 width: "150px",
  // //                 height: "150px",
  // //                 borderRadius: "50%",
  // //                 background: `conic-gradient(#28a745 ${result}%, #e9ecef ${result}% 100%)`,
  // //                 display: "flex",
  // //                 alignItems: "center",
  // //                 justifyContent: "center",
  // //                 position: "relative"
  // //               }}>
  // //                 <div className="position-absolute" style={{
  // //                   width: "120px",
  // //                   height: "120px",
  // //                   borderRadius: "50%",
  // //                   background: "white",
  // //                   display: "flex",
  // //                   alignItems: "center",
  // //                   justifyContent: "center"
  // //                 }}>
  // //                   <div className="display-4 fw-bold text-success">{result}%</div>
  // //                 </div>
  // //               </div>
                
  // //               <div className="mt-3">
  // //                 <h4 className="mb-2">
  // //                   {result >= 80 ? "Excellent! 🎉" : 
  // //                    result >= 60 ? "Good Job! 👍" : 
  // //                    "Keep Practicing! 💪"}
  // //                 </h4>
  // //                 <p className="text-muted">
  // //                   {result >= 80 ? "You've mastered this material!" : 
  // //                    result >= 60 ? "Solid understanding, but room for improvement" : 
  // //                    "Review the concepts and try again"}
  // //                 </p>
  // //               </div>
  // //             </div>

  // //             {explanations.length > 0 && (
  // //               <>
  // //                 <h5 className="mb-3 border-bottom pb-2">
  // //                   <i className="bi bi-lightbulb me-2"></i>
  // //                   Detailed Feedback
  // //                 </h5>
  // //                 {explanations.map((exp, index) => (
  // //                   <div 
  // //                     key={index} 
  // //                     className={`mb-4 p-3 rounded ${exp.isCorrect ? 'bg-success-light' : 'bg-danger-light'}`}
  // //                     style={{
  // //                       backgroundColor: exp.isCorrect ? '#e8f5e9' : '#ffebee',
  // //                       borderLeft: `4px solid ${exp.isCorrect ? '#4caf50' : '#f44336'}`
  // //                     }}
  // //                   >
  // //                     <div className="d-flex align-items-center mb-2">
  // //                       <span className="badge bg-white text-dark me-2" style={{
  // //                         border: `1px solid ${exp.isCorrect ? '#4caf50' : '#f44336'}`,
  // //                         fontSize: '1rem'
  // //                       }}>
  // //                         Q{index + 1}
  // //                       </span>
  // //                       <strong className="flex-grow-1">{exp.question}</strong>
  // //                       <span className={`badge ${exp.isCorrect ? 'bg-success' : 'bg-danger'}`}>
  // //                         {exp.isCorrect ? 'Correct' : 'Incorrect'}
  // //                       </span>
  // //                     </div>
                      
  // //                     <div className="mt-2">
  // //                       <div className="d-flex mb-2">
  // //                         <div className="me-4">
  // //                           <span className="fw-bold">Your answer:</span> 
  // //                           <span className={`ms-2 ${exp.isCorrect ? 'text-success' : 'text-danger'}`}>
  // //                             {exp.userAnswer || "Not answered"}
  // //                           </span>
  // //                         </div>
  // //                         <div>
  // //                           <span className="fw-bold">Correct answer:</span> 
  // //                           <span className="ms-2 text-success">{exp.correctAnswer}</span>
  // //                         </div>
  // //                       </div>
                        
  // //                       <p className="mb-2">
  // //                         <span className="fw-bold">Explanation:</span> {exp.explanation}
  // //                       </p>
                        
  // //                       {exp.flashcard && (
  // //                         <div className="mt-2 p-3 bg-white rounded border flashcard-hint">
  // //                           <div className="d-flex align-items-center mb-2">
  // //                             <i className="bi bi-card-text me-2 text-warning"></i>
  // //                             <span className="fw-bold">Related Concept</span>
  // //                           </div>
  // //                           <div>
  // //                             <span className="fw-bold text-primary">{exp.flashcard.term}</span>
  // //                             <p className="mb-0">{exp.flashcard.definition}</p>
  // //                           </div>
  // //                         </div>
  // //                       )}
  // //                     </div>
  // //                   </div>
  // //                 ))}
  // //               </>
  // //             )}
  // //           </div>
  // //         </div>
  // //       )}
  // //     </div>
  // //   );
  // // }

  // // export default NotesUpload;

  // // NotesUpload.js
  // // import React, { useState, useEffect } from "react";
  // // import "bootstrap/dist/css/bootstrap.min.css";
  // // import "./NoteUpload.css";

  // // export default function NotesUpload() {
  // //   const [file, setFile] = useState(null);
  // //   const [uploading, setUploading] = useState(false);
  // //   const [progress, setProgress] = useState(0);
  // //   const [activeTab, setActiveTab] = useState("quiz");
  // //   const [quizQuestions, setQuizQuestions] = useState([]);
  // //   const [flashcards, setFlashcards] = useState([]);
  // //   const [summaries, setSummaries] = useState([]);
  // //   const [error, setError] = useState("");

  // //   // Handle file selection
  // //   const handleFileChange = (e) => {
  // //     setFile(e.target.files[0]);
  // //     setError("");
  // //   };

  // //   // Handle upload
  // //   const handleUpload = async () => {
  // //     if (!file) {
  // //       setError("Please select a PDF file first.");
  // //       return;
  // //     }
  // //     if (file.type !== "application/pdf") {
  // //       setError("Only PDF files are allowed.");
  // //       return;
  // //     }

  // //     setUploading(true);
  // //     setProgress(10);

  // //     try {
  // //       const token = localStorage.getItem("token");
  // //       const formData = new FormData();
  // //       formData.append("file", file);

  // //       const uploadRes = await fetch("http://localhost:8000/api/notes/upload/", {
  // //         method: "POST",
  // //         headers: {
  // //           Authorization: `Token ${token}`,
  // //         },
  // //         body: formData,
  // //       });

  // //       if (!uploadRes.ok) throw new Error("Failed to upload file");
  // //       setProgress(40);

  // //       // Poll progress endpoint
  // //       const checkProgress = setInterval(async () => {
  // //         const progressRes = await fetch("http://localhost:8000/api/notes/progress/", {
  // //           headers: { Authorization: `Token ${token}` },
  // //         });
  // //         const progressData = await progressRes.json();
  // //         setProgress(progressData.progress || 60);

  // //         if (progressData.progress >= 100) {
  // //           clearInterval(checkProgress);
  // //           setProgress(100);
  // //           // Fetch quiz, flashcards, and summaries
  // //           setQuizQuestions(progressData.quiz || []);
  // //           setFlashcards(progressData.flashcards || []);
  // //           setSummaries(progressData.summaries || []);
  // //           setUploading(false);
  // //         }
  // //       }, 10000);
  // //     } catch (err) {
  // //       console.error(err);
  // //       setError("Something went wrong. Please try again.");
  // //       setUploading(false);
  // //     }
  // //   };

  // //   return (
  // //     <div className="container py-5">
  // //       <h2 className="text-center mb-4 text-primary">📄 Upload Notes</h2>

  // //       {error && <div className="alert alert-danger">{error}</div>}

  // //       <div className="card shadow-lg p-4">
  // //         <div className="mb-3">
  // //           <input
  // //             type="file"
  // //             className="form-control"
  // //             onChange={handleFileChange}
  // //             accept="application/pdf"
  // //           />
  // //         </div>
  // //         <button
  // //           className="btn btn-success w-100"
  // //           onClick={handleUpload}
  // //           disabled={uploading}
  // //         >
  // //           {uploading ? "Processing..." : "Upload & Generate"}
  // //         </button>

  // //         {uploading && (
  // //           <div className="mt-4">
  // //             <div className="progress" style={{ height: "20px" }}>
  // //               <div
  // //                 className="progress-bar progress-bar-striped progress-bar-animated bg-info"
  // //                 style={{ width: `${progress}%` }}
  // //               >
  // //                 {progress}%
  // //               </div>
  // //             </div>
  // //           </div>
  // //         )}
  // //       </div>

  // //       {/* Tabs for results */}
  // //       {quizQuestions.length > 0 && (
  // //         <div className="mt-5">
  // //           <ul className="nav nav-tabs">
  // //             <li className="nav-item">
  // //               <button
  // //                 className={`nav-link ${activeTab === "quiz" ? "active" : ""}`}
  // //                 onClick={() => setActiveTab("quiz")}
  // //               >
  // //                 📝 Quiz
  // //               </button>
  // //             </li>
  // //             <li className="nav-item">
  // //               <button
  // //                 className={`nav-link ${activeTab === "flashcards" ? "active" : ""}`}
  // //                 onClick={() => setActiveTab("flashcards")}
  // //               >
  // //                 🎯 Flashcards
  // //               </button>
  // //             </li>
  // //             <li className="nav-item">
  // //               <button
  // //                 className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
  // //                 onClick={() => setActiveTab("summary")}
  // //               >
  // //                 📚 Summary
  // //               </button>
  // //             </li>
  // //           </ul>

  // //           <div className="tab-content mt-4">
  // //             {activeTab === "quiz" && (
  // //               <div>
  // //                 {quizQuestions.map((q, idx) => (
  // //                   <div key={idx} className="card mb-3 p-3 shadow-sm">
  // //                     <h5>{q.question}</h5>
  // //                     <ul>
  // //                       {q.options.map((opt, i) => (
  // //                         <li key={i}>{opt}</li>
  // //                       ))}
  // //                     </ul>
  // //                   </div>
  // //                 ))}
  // //               </div>
  // //             )}

  // //             {activeTab === "flashcards" && (
  // //               <div>
  // //                 {flashcards.map((f, idx) => (
  // //                   <div key={idx} className="card mb-3 p-3 shadow-sm">
  // //                     <h6 className="text-primary">{f.term}</h6>
  // //                     <p>{f.definition || "No definition available"}</p>
  // //                   </div>
  // //                 ))}
  // //               </div>
  // //             )}

  // //             {activeTab === "summary" && (
  // //               <div>
  // //                 {summaries.map((s, idx) => (
  // //                   <div key={idx} className="card mb-3 p-3 shadow-sm">
  // //                     <h6>{s.topic}</h6>
  // //                     <p>{s.summary}</p>
  // //                   </div>
  // //                 ))}
  // //               </div>
  // //             )}
  // //           </div>
  // //         </div>
  // //       )}
  // //     </div>
  // //   );
  // // }
  // // src/NotesUpload.js

  // // import React, { useState, useEffect, useRef } from "react"; 
  // // import axios from "axios";
  // // import "bootstrap/dist/css/bootstrap.min.css";
  // // import "./NoteUpload.css";

  // // function NotesUpload() {
  // //   const [file, setFile] = useState(null);
  // //   const [notes, setNotes] = useState([]);
  // //   const [activeQuiz, setActiveQuiz] = useState(null);
  // //   const [userAnswers, setUserAnswers] = useState({});
  // //   const [quizResult, setQuizResult] = useState(null);
  // //   const [expandedNoteId, setExpandedNoteId] = useState(null);

  // //   const [loadingNotes, setLoadingNotes] = useState(true);
  // //   const [uploading, setUploading] = useState(false);
  // //   const [error, setError] = useState('');
  // //   const [success, setSuccess] = useState('');

  // //   const pollingIntervals = useRef(null);
  // //   const fileInputRef = useRef(null);

  // //   const token = localStorage.getItem("token");
  // //   const headers = { Authorization: `Token ${token}` };
  // //   const apiClient = axios.create({ baseURL: '/api', headers });

  // //   useEffect(() => {
  // //     fetchNotes();
  // //     return () => clearInterval(pollingIntervals.current);
  // //   }, []);

  // //   const fetchNotes = async () => {
  // //     try {
  // //       const res = await apiClient.get("/notes/progress/");
  // //       setNotes(res.data);
  // //       const processingNote = res.data.find(n => ['PROCESSING', 'PENDING'].includes(n.status));
  // //       if (processingNote && !pollingIntervals.current) {
  // //         pollForNoteStatus(processingNote.id);
  // //       }
  // //     } catch {
  // //       setError("Failed to load notes. Please refresh the page.");
  // //     } finally {
  // //       setLoadingNotes(false);
  // //     }
  // //   };

  // //   const pollForNoteStatus = (noteId) => {
  // //     if (pollingIntervals.current) clearInterval(pollingIntervals.current);
  // //     pollingIntervals.current = setInterval(async () => {
  // //       try {
  // //         const res = await apiClient.get(`/notes/${noteId}/status/`);
  // //         if (['COMPLETED', 'FAILED'].includes(res.data.status)) {
  // //           clearInterval(pollingIntervals.current);
  // //           pollingIntervals.current = null;
  // //           fetchNotes();
  // //         } else {
  // //           // Update this note's data live
  // //           setNotes(prev =>
  // //             prev.map(n => n.id === noteId ? { ...n, ...res.data.data, status: res.data.status } : n)
  // //           );
  // //         }
  // //       } catch {
  // //         clearInterval(pollingIntervals.current);
  // //         pollingIntervals.current = null;
  // //         setError("Error checking processing status.");
  // //       }
  // //     }, 5000);
  // //   };

  // //   const handleUpload = async () => {
  // //     if (!file) return setError("Please select a file first.");
  // //     setUploading(true);
  // //     setError('');
  // //     setSuccess('');
  // //     const formData = new FormData();
  // //     formData.append("file", file);

  // //     try {
  // //       const res = await apiClient.post("/notes/upload/", formData);
  // //       setSuccess(res.data.message || "Upload started.");
  // //       setNotes(prev => [{
  // //         id: res.data.note_id,
  // //         title: file.name,
  // //         status: 'PROCESSING',
  // //         topics: [],
  // //         flashcards: [],
  // //         quiz_questions: []
  // //       }, ...prev]);
  // //       pollForNoteStatus(res.data.note_id);
  // //       setFile(null);
  // //       if (fileInputRef.current) fileInputRef.current.value = "";
  // //     } catch (err) {
  // //       setError(err.response?.data?.error || "Upload failed. Please try again.");
  // //     } finally {
  // //       setUploading(false);
  // //     }
  // //   };

  // //   const handleDelete = async (noteId) => {
  // //     if (window.confirm("Are you sure you want to delete this note?")) {
  // //       try {
  // //         await apiClient.delete(`/notes/${noteId}/delete/`);
  // //         setNotes(notes.filter(n => n.id !== noteId));
  // //         setSuccess("Note deleted successfully.");
  // //       } catch {
  // //         setError("Failed to delete note.");
  // //       }
  // //     }
  // //   };

  // //   const loadQuiz = async (noteId) => {
  // //     try {
  // //       const res = await apiClient.get(`/notes/${noteId}/status/`);
  // //       setActiveQuiz({ noteId, questions: res.data.data.quiz_questions || [] });
  // //     } catch {
  // //       setError("Failed to load quiz.");
  // //     }
  // //   };

  // //   const handleQuizSubmit = async () => {
  // //   if (!activeQuiz || !activeQuiz.questions) {
  // //     return setError("No quiz data to submit.");
  // //   }

  // //   if (Object.keys(userAnswers).length !== activeQuiz.questions.length) {
  // //     return setError("Please answer all questions before submitting.");
  // //   }

  // //   setError('');
  // //   try {
  // //     const res = await apiClient.post(
  // //       `/notes/${activeQuiz.noteId}/submit-quiz/`,
  // //       { answers: userAnswers }
  // //     );

  // //     // Save result so UI can render it
  // //     setQuizResult({
  // //       score: res.data.score,
  // //       perTopic: res.data.per_topic_score || {},
  // //       explanations: res.data.explanations || []
  // //     });

  // //     setActiveQuiz(null); // close quiz UI
  // //   } catch (err) {
  // //     setError(err.response?.data?.error || "Failed to submit quiz.");
  // //   }
  // // };

  // //   const renderNote = (note) => {
  // //     const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
  // //     const statusText = validStatuses.includes(note.status) ? note.status : 'PENDING';
  // //     return (
  // //       <div key={note.id} className="list-group-item">
  // //         <div className="d-flex justify-content-between align-items-center">
  // //           <div>
  // //             <h6 className="mb-0">{note.title}</h6>
  // //             <small className={`status-${statusText.toLowerCase()}`}>Status: {statusText}</small>
  // //           </div>
  // //           <div className="btn-group">
  // //             <button
  // //               className="btn btn-sm btn-outline-secondary"
  // //               onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
  // //               disabled={note.topics?.length === 0}
  // //             >Details</button>
  // //             <button
  // //               className="btn btn-sm btn-outline-success"
  // //               onClick={() => loadQuiz(note.id)}
  // //               disabled={note.quiz_questions?.length === 0}
  // //             >Take Quiz</button>
  // //             <button
  // //               className="btn btn-sm btn-outline-danger"
  // //               onClick={() => handleDelete(note.id)}
  // //             >Delete</button>
  // //           </div>
  // //         </div>
  // //         {expandedNoteId === note.id && (
  // //           <div className="mt-3 border-top pt-3">
  // //             <h5>Generated Content</h5>
  // //             <h6>Summaries</h6>
  // //             {note.topics.map((t, i) => <p key={i}><strong>{t.topic}:</strong> {t.summary}</p>)}
  // //             <hr/>
  // //             <h6>Flashcards</h6>
  // //             {note.flashcards.map((f, i) => <p key={i}><strong>{f.term}:</strong> {f.definition}</p>)}
  // //           </div>
  // //         )}
  // //       </div>
  // //     );
  // //   };

  // //   const renderQuiz = () => (
  // //     <div className="card shadow my-4">
  // //       <div className="card-header d-flex justify-content-between">
  // //         <h5>Quiz Time!</h5>
  // //         <button className="btn-close" onClick={() => setActiveQuiz(null)}></button>
  // //       </div>
  // //       <div className="card-body">
  // //         {activeQuiz.questions.map((q, i) => (
  // //           <div key={q.id} className="mb-4">
  // //             <p><strong>Question {i + 1}:</strong> {q.question}</p>
  // //             {Object.entries(q.options).map(([key, value]) => (
  // //               <div className="form-check" key={key}>
  // //                 <input
  // //                   className="form-check-input"
  // //                   type="radio"
  // //                   name={`q-${q.id}`}
  // //                   id={`q-${q.id}-opt-${key}`}
  // //                   value={key}
  // //                   onChange={() => setUserAnswers(prev => ({...prev, [q.id]: key}))}
  // //                 />
  // //                 <label className="form-check-label" htmlFor={`q-${q.id}-opt-${key}`}>{value}</label>
  // //               </div>
  // //             ))}
  // //           </div>
  // //         ))}
  // //         <button className="btn btn-primary" onClick={handleQuizSubmit}>Submit Answers</button>
  // //       </div>
  // //     </div>
  // //   );

  // //   const renderQuizResult = () => (
  // //   <div className="card shadow my-4">
  // //     <div className="card-header d-flex justify-content-between">
  // //       <h5>Quiz Result</h5>
  // //       <button className="btn-close" onClick={() => setQuizResult(null)}></button>
  // //     </div>
  // //     <div className="card-body">
  // //       <h3 className="text-center">Your Score: {quizResult.score}%</h3>

  // //       {/* Topic breakdown */}
  // //       {quizResult.perTopic && Object.keys(quizResult.perTopic).length > 0 && (
  // //         <>
  // //           <hr/>
  // //           <h6>Performance by Topic:</h6>
  // //           <ul>
  // //             {Object.entries(quizResult.perTopic).map(([topic, score]) => (
  // //               <li key={topic}><strong>{topic}:</strong> {score}%</li>
  // //             ))}
  // //           </ul>
  // //         </>
  // //       )}

  // //       <hr/>
  // //       {quizResult.explanations.map((exp, i) => (
  // //         <div key={i} className={`p-3 rounded mb-3 ${exp.isCorrect ? 'bg-success-light' : 'bg-danger-light'}`}>
  // //           <p><strong>Q: {exp.question}</strong></p>
  // //           <p>Your Answer: <span className={exp.isCorrect ? '' : 'text-danger'}>{exp.userAnswer}</span></p>
  // //           {!exp.isCorrect && <p>Correct Answer: <span className="text-success">{exp.correctAnswer}</span></p>}
  // //           {exp.explanation && <p><em>{exp.explanation}</em></p>}
  // //           {exp.flashcard && (
  // //             <p className="small text-muted">
  // //               Related flashcard: {exp.flashcard.term} — {exp.flashcard.definition}
  // //             </p>
  // //           )}
  // //         </div>
  // //       ))}
  // //     </div>
  // //   </div>
  // // );


  // //   return (
  // //     <div className="container my-4">
  // //       <h2 className="text-center mb-4">Notes Dashboard</h2>
  // //       {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
  // //       {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

  // //       <div className="card shadow mb-4">
  // //         <div className="card-header">Upload New Note</div>
  // //         <div className="card-body">
  // //           <input type="file" ref={fileInputRef} className="form-control mb-2" onChange={e => setFile(e.target.files[0])} accept=".pdf,.docx,.txt" />
  // //           <button onClick={handleUpload} className="btn btn-primary" disabled={uploading}>
  // //             {uploading ? "Uploading..." : "Upload & Process"}
  // //           </button>
  // //         </div>
  // //       </div>

  // //       {activeQuiz ? renderQuiz() : quizResult ? renderQuizResult() : (
  // //         <div className="card shadow">
  // //           <div className="card-header">Your Notes</div>
  // //           <div className="card-body">
  // //             {loadingNotes ? <p>Loading...</p> : notes.length > 0 ? (
  // //               <div className="list-group">{notes.map(renderNote)}</div>
  // //             ) : <p>No notes uploaded yet.</p>}
  // //           </div>
  // //         </div>
  // //       )}
  // //     </div>
  // //   );
  // // }

  // // export default NotesUpload;
  // import React, { useState, useEffect, useRef } from "react";
  // import axios from "axios";
  // import "bootstrap/dist/css/bootstrap.min.css";
  // import "./NoteUpload.css";

  // function NotesUpload() {
  //   const [file, setFile] = useState(null);
  //   const [notes, setNotes] = useState([]);
  //   const [activeQuiz, setActiveQuiz] = useState(null);
  //   const [userAnswers, setUserAnswers] = useState({});
  //   const [quizResult, setQuizResult] = useState(null);
  //   const [expandedNoteId, setExpandedNoteId] = useState(null);

  //   const [loadingNotes, setLoadingNotes] = useState(true);
  //   const [uploading, setUploading] = useState(false);
  //   const [error, setError] = useState("");
  //   const [success, setSuccess] = useState("");

  //   const pollingIntervals = useRef(null);
  //   const fileInputRef = useRef(null);

  //   const token = localStorage.getItem("token");
  //   const headers = { Authorization: `Token ${token}` };
  //   const apiClient = axios.create({ baseURL: "/api", headers });

  //   useEffect(() => {
  //     fetchNotes();
  //     return () => clearInterval(pollingIntervals.current);
  //   }, []);

  //   const fetchNotes = async () => {
  //     try {
  //       const res = await apiClient.get("/notes/progress/");
  //       setNotes(res.data);
  //       const processingNote = res.data.find((n) =>
  //         ["PROCESSING", "PENDING"].includes(n.status)
  //       );
  //       if (processingNote && !pollingIntervals.current) {
  //         pollForNoteStatus(processingNote.id);
  //       }
  //     } catch {
  //       setError("❌ Failed to load notes. Please refresh the page.");
  //     } finally {
  //       setLoadingNotes(false);
  //     }
  //   };

  //   const pollForNoteStatus = (noteId) => {
  //     if (pollingIntervals.current) clearInterval(pollingIntervals.current);
  //     pollingIntervals.current = setInterval(async () => {
  //       try {
  //         const res = await apiClient.get(`/notes/${noteId}/status/`);
  //         if (["COMPLETED", "FAILED"].includes(res.data.status)) {
  //           clearInterval(pollingIntervals.current);
  //           pollingIntervals.current = null;
  //           fetchNotes();
  //         } else {
  //           setNotes((prev) =>
  //             prev.map((n) =>
  //               n.id === noteId
  //                 ? { ...n, ...res.data.data, topics: res.data.data.topics || n.topics,
  //                   flashcards: res.data.data.flashcards || n.flashcards,
  //                   quiz_questions: res.data.data.quiz_questions || n.quiz_questions, status: res.data.status }
  //                 : n
  //             )
  //           );
  //         }
  //       } catch {
  //         clearInterval(pollingIntervals.current);
  //         pollingIntervals.current = null;
  //         setError("⚠️ Error checking processing status.");
  //       }
  //     }, 5000);
  //   };

  //   const handleUpload = async () => {
  //     if (!file) return setError("📂 Please select a file first.");
  //     setUploading(true);
  //     setError("");
  //     setSuccess("");
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const res = await apiClient.post("/notes/upload/", formData);
  //       setSuccess(res.data.message || "✅ Upload started.");
  //       setNotes((prev) => [
  //         {
  //           id: res.data.note_id,
  //           title: file.name,
  //           status: "PROCESSING",
  //           topics: [],
  //           flashcards: [],
  //           quiz_questions: [],
  //         },
  //         ...prev,
  //       ]);
  //       pollForNoteStatus(res.data.note_id);
  //       setFile(null);
  //       if (fileInputRef.current) fileInputRef.current.value = "";
  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Upload failed. Please try again.");
  //     } finally {
  //       setUploading(false);
  //     }
  //   };

  //   const handleDelete = async (noteId) => {
  //     if (window.confirm("🗑 Are you sure you want to delete this note?")) {
  //       try {
  //         await apiClient.delete(`/notes/${noteId}/delete/`);
  //         setNotes(notes.filter((n) => n.id !== noteId));
  //         setSuccess("✅ Note deleted successfully.");
  //       } catch {
  //         setError("❌ Failed to delete note.");
  //       }
  //     }
  //   };

  //   const loadQuiz = async (noteId) => {
  //     try {
  //       const res = await apiClient.get(`/notes/${noteId}/status/`);
  //       setActiveQuiz({ noteId, questions: res.data.data.quiz_questions || [] });
  //     } catch {
  //       setError("❌ Failed to load quiz.");
  //     }
  //   };

  //   const handleQuizSubmit = async () => {
  //     if (!activeQuiz || !activeQuiz.questions) {
  //       return setError("⚠️ No quiz data to submit.");
  //     }

  //     if (Object.keys(userAnswers).length !== activeQuiz.questions.length) {
  //       return setError("⚠️ Please answer all questions before submitting.");
  //     }

  //     setError("");
  //     try {
  //       const res = await apiClient.post(
  //         `/notes/${activeQuiz.noteId}/submit-quiz/`,
  //         { answers: userAnswers }
  //       );

  //       const quizData = {
  //         score: res.data.score,
  //         perTopic: res.data.per_topic_score || {},
  //         explanations: res.data.explanations || [],
  //       };
  //       setQuizResult(quizData);

  //       // 📌 Adaptive Learning Hook
  //       const weakTopics = Object.entries(quizData.perTopic || {})
  //         .filter(([topic, score]) => score < 60)
  //         .map(([topic]) => topic);

  //       if (weakTopics.length > 0) {
  //         if (window.confirm(
  //           `You scored low in: ${weakTopics.join(", ")}. Do you want to add extra resources to your study plan?`
  //         )) {
  //           await apiClient.post("/study-plan/adapt/", {
  //             note_id: activeQuiz.noteId,
  //             weak_topics: weakTopics
  //           });
  //           setSuccess("✅ Extra resources have been added to your study plan.");
  //         }
  //       }

  //       setActiveQuiz(null);

  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Failed to submit quiz.");
  //     }
  //   };


  //   // const renderNote = (note) => {
  //   //   const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
  //   //   const statusText = validStatuses.includes(note.status)
  //   //     ? note.status
  //   //     : "PENDING";
  //   //   return (
  //   //     <div key={note.id} className="list-group-item p-3 shadow-sm">
  //   //       <div className="d-flex justify-content-between align-items-center">
  //   //         <div>
  //   //           <h6 className="mb-0 fw-bold">{note.title}</h6>
  //   //           <small className={`text-muted`}>Status: {statusText}</small>
  //   //         </div>
  //   //         <div className="btn-group">
  //   //           <button
  //   //             className="btn btn-sm btn-outline-secondary"
  //   //             onClick={() =>
  //   //               setExpandedNoteId(expandedNoteId === note.id ? null : note.id)
  //   //             }
  //   //             disabled={note.topics?.length === 0}
  //   //           >
  //   //             📄 Details
  //   //           </button>
  //   //           <button
  //   //             className="btn btn-sm btn-outline-success"
  //   //             onClick={() => loadQuiz(note.id)}
  //   //             disabled={note.quiz_questions?.length === 0}
  //   //           >
  //   //             📝 Take Quiz
  //   //           </button>
  //   //           <button
  //   //             className="btn btn-sm btn-outline-danger"
  //   //             onClick={() => handleDelete(note.id)}
  //   //           >
  //   //             🗑 Delete
  //   //           </button>
  //   //         </div>
  //   //       </div>
  //   //       {expandedNoteId === note.id && (
  //   //         <div className="mt-3 border-top pt-3">
  //   //           <h5 className="fw-bold text-primary">Generated Content</h5>
  //   //           <h6 className="fw-semibold">Summaries</h6>
  //   //           {note.topics.map((t, i) => (
  //   //             <p key={i}>
  //   //               <strong>{t.topic}:</strong> {t.summary}
  //   //             </p>
  //   //           ))}
  //   //           <hr />
  //   //           <h6 className="fw-semibold">Flashcards</h6>
  //   //           {note.flashcards.map((f, i) => (
  //   //             <p key={i}>
  //   //               <strong>{f.term}:</strong> {f.definition}
  //   //             </p>
  //   //           ))}
  //   //         </div>
  //   //       )}
  //   //     </div>
  //   //   );
  //   // };
  // //   const renderNote = (note) => {
  // //   const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
  // //   const statusText = validStatuses.includes(note.status)
  // //     ? note.status
  // //     : "PENDING";
  // //   return (
  // //     <div key={note.id} className="list-group-item p-3 shadow-sm">
  // //       <div className="d-flex justify-content-between align-items-center">
  // //         <div>
  // //           <h6 className="mb-0 fw-bold">{note.title}</h6>
  // //           <small className="text-muted">Status: {statusText}</small>
  // //         </div>
  // //         <div className="btn-group">
  // //           <button
  // //             className="btn btn-sm btn-outline-secondary"
  // //             onClick={() =>
  // //               setExpandedNoteId(expandedNoteId === note.id ? null : note.id)
  // //             }
  // //             disabled={note.topics?.length === 0}
  // //           >
  // //             📄 Details
  // //           </button>
  // //           <button
  // //             className="btn btn-sm btn-outline-success"
  // //             onClick={() => loadQuiz(note.id)}
  // //             disabled={note.quiz_questions?.length === 0}
  // //           >
  // //             📝 Take Quiz
  // //           </button>
  // //           <button
  // //             className="btn btn-sm btn-outline-danger"
  // //             onClick={() => handleDelete(note.id)}
  // //           >
  // //             🗑 Delete
  // //           </button>
  // //         </div>
  // //       </div>

  // //       {expandedNoteId === note.id && (
  // //         <div className="mt-3 border-top pt-3">
  // //           {/* Summaries */}
  // //           <h5 className="fw-bold text-primary mb-3">📘 Summaries</h5>
  // //           <div className="row g-3">
  // //             {note.topics.map((t, i) => (
  // //               <div className="col-md-4" key={i}>
  // //                 <div className="card shadow-sm h-100 border-0 summary-card card-glow">
  // //                   <div className="card-header d-flex align-items-center">
  // //                      <span className="me-2">📖</span> {t.topic}
  // //                   </div>
  // //                   <div className="card-body">
  // //                     <p className="card-text ">{t.summary}</p>
  // //                   </div>
  // //                 </div>
  // //               </div>
  // //             ))}
  // //           </div>

  // //           <hr className="my-4" />

  // //           {/* Flashcards
  // //           <h5 className="fw-bold text-warning mb-3">💡 Flashcards</h5>
  // //           <div className="row g-3">
  // //             {note.flashcards.map((f, i) => (
  // //               <div className="col-md-4" key={i}>
  // //                 <div className="flashcard card shadow-sm h-100 border-0">
  // //                   <div className="card-header bg-warning text-dark fw-semibold">
  // //                     {f.term}
  // //                   </div>
  // //                   <div className="card-body">
  // //                     <p className="text-secondary">{f.definition}</p>
  // //                   </div>
  // //                 </div>
  // //               </div>
  // //             ))}
  // //           </div> */}
  // //                  {/* Flashcards */}
  // // <h5 className="fw-bold text-warning mb-3">💡 Flashcards</h5>
  // // <div className="row g-3">
  // //   {note.flashcards && note.flashcards.length > 0 ? (
  // //     note.flashcards.map((f, i) => (
  // //       <div className="col-md-4" key={i}>
  // //         <div className="flashcard-flip">
  // //           <div className="flashcard-inner">
              
  // //             {/* Front */}
  // //             <div className="flashcard-front">
  // //               <div className="card shadow-sm h-100 border-0 flashcard-card">
  // //                 <div className="card-header bg-warning text-dark fw-semibold">
  // //                   <span className="me-2">💡</span>{f.term}
  // //                 </div>
  // //                 <div className="card-body d-flex align-items-center justify-content-center">
  // //                   <p className="m-0 text-secondary">Hover to see definition</p>
  // //                 </div>
  // //               </div>
  // //             </div>

  // //             {/* Back */}
  // //             <div className="flashcard-back">
  // //               <div className="card shadow-sm h-100 border-0">
  // //                 <div className="card-header bg-warning text-dark fw-semibold">
  // //                   {f.term}
  // //                 </div>
  // //                 <div className="card-body d-flex align-items-center justify-content-center">
  // //                   <p className="m-0 text-secondary">{f.definition}</p>
  // //                 </div>
  // //               </div>
  // //             </div>

  // //           </div>
  // //         </div>
  // //       </div>
  // //     ))
  // //   ) : (
  // //     <p className="text-muted">No flashcards generated for this note.</p>
  // //   )}
  // // </div>


  // //         </div>
  // //       )}
  // //     </div>
  // //   );
  // // };


  // //   const renderQuiz = () => (
  // //     <div className="card quiz-question my-4">
  // //       <div className="card-header d-flex justify-content-between">
  // //         <h5>🎯 Quiz Time!</h5>
  // //         <button className="btn-close" onClick={() => setActiveQuiz(null)}></button>
  // //       </div>
  // //       <div className="card-body">
  // //         {activeQuiz.questions.map((q, i) => (
  // //           <div key={q.id} className="mb-4">
  // //             <p>
  // //               <strong>Question {i + 1}:</strong> {q.question}
  // //             </p>
  // //             {Object.entries(q.options).map(([key, value]) => (
  // //               <div className="form-check" key={key}>
  // //                 <input
  // //                   className="form-check-input"
  // //                   type="radio"
  // //                   name={`q-${q.id}`}
  // //                   id={`q-${q.id}-opt-${key}`}
  // //                   value={key}
  // //                   onChange={() =>
  // //                     setUserAnswers((prev) => ({ ...prev, [q.id]: key }))
  // //                   }
  // //                 />
  // //                 <label
  // //                   className="form-check-label"
  // //                   htmlFor={`q-${q.id}-opt-${key}`}
  // //                 >
  // //                   {value}
  // //                 </label>
  // //               </div>
  // //             ))}
  // //           </div>
  // //         ))}
  // //         <button className="btn btn-primary" onClick={handleQuizSubmit}>
  // //           🚀 Submit Answers
  // //         </button>
  // //       </div>
  // //     </div>
  // //   );

  // //   const renderQuizResult = () => (
  // //     <div className="card shadow my-4">
  // //       <div className="card-header d-flex justify-content-between">
  // //         <h5>📊 Quiz Result</h5>
  // //         <button className="btn-close" onClick={() => setQuizResult(null)}></button>
  // //       </div>
  // //       <div className="card-body text-center">
  // //         <div
  // //           className="result-circle"
  // //           style={{ "--progress": `${quizResult.score}%` }}
  // //         >
  // //           <div className="result-circle-inner">{quizResult.score}%</div>
  // //         </div>

  // //         {quizResult.perTopic && Object.keys(quizResult.perTopic).length > 0 && (
  // //           <>
  // //             <hr />
  // //             <h6 className="fw-semibold">Performance by Topic:</h6>
  // //             <ul className="list-unstyled">
  // //               {Object.entries(quizResult.perTopic).map(([topic, score]) => (
  // //                 <li key={topic}>
  // //                   <strong>{topic}:</strong> {score}%
  // //                 </li>
  // //               ))}
  // //             </ul>
  // //           </>
  // //         )}

  // //         <hr />
  // //         {quizResult.explanations.map((exp, i) => (
  // //           <div
  // //             key={i}
  // //             className={`p-3 rounded mb-3 ${
  // //               exp.isCorrect ? "bg-success-light" : "bg-danger-light"
  // //             }`}
  // //           >
  // //             <p>
  // //               <strong>Q: {exp.question}</strong>
  // //             </p>
  // //             <p>
  // //               Your Answer:{" "}
  // //               <span className={exp.isCorrect ? "" : "text-danger"}>
  // //                 {exp.userAnswer}
  // //               </span>
  // //             </p>
  // //             {!exp.isCorrect && (
  // //               <p>
  // //                 Correct Answer:{" "}
  // //                 <span className="text-success">{exp.correctAnswer}</span>
  // //               </p>
  // //             )}
  // //             {exp.explanation && <p><em>{exp.explanation}</em></p>}
  // //             {exp.flashcard && (
  // //               <p className="small text-muted">
  // //                 💡 Related flashcard: {exp.flashcard.term} —{" "}
  // //                 {exp.flashcard.definition}
  // //               </p>
  // //             )}
  // //           </div>
  // //         ))}
  // //       </div>
  // //     </div>
  // //   );

  // //   return (
  // //     <div className="notes-upload-container">
  // //       <h2 className="text-center mb-4">📚 Notes Dashboard</h2>

  // //       {error && (
  // //         <div className="alert alert-danger" onClick={() => setError("")}>
  // //           {error}
  // //         </div>
  // //       )}
  // //       {success && (
  // //         <div className="alert alert-success" onClick={() => setSuccess("")}>
  // //           {success}
  // //         </div>
  // //       )}

  // //       {/* Upload Box */}
  // //       <div className="card shadow mb-4">
  // //         <div className="card-header">📤 Upload New Note</div>
  // //         <div className="card-body text-center">
  // //           <div className="upload-box">
  // //             <input
  // //               type="file"
  // //               ref={fileInputRef}
  // //               className="form-control mb-3"
  // //               onChange={(e) => setFile(e.target.files[0])}
  // //               accept=".pdf,.docx,.txt"
  // //             />
  // //             <button
  // //               onClick={handleUpload}
  // //               className="btn btn-primary"
  // //               disabled={uploading}
  // //             >
  // //               {uploading ? "⏳ Uploading..." : "🚀 Upload & Process"}
  // //             </button>
  // //           </div>
  // //         </div>
  // //       </div>

  // //       {/* Notes List / Quiz */}
  // //       {activeQuiz
  // //         ? renderQuiz()
  // //         : quizResult
  // //         ? renderQuizResult()
  // //         : (
  // //           <div className="card shadow">
  // //             <div className="card-header">📄 Your Notes</div>
  // //             <div className="card-body">
  // //               {loadingNotes ? (
  // //                 <div className="text-center">
  // //                   <div className="spinner-border text-primary"></div>
  // //                 </div>
  // //               ) : notes.length > 0 ? (
  // //                 <div className="list-group">{notes.map(renderNote)}</div>
  // //               ) : (
  // //                 <p className="text-muted text-center">
  // //                   No notes uploaded yet.
  // //                 </p>
  // //               )}
  // //             </div>
  // //           </div>
  // //         )}
  // //     </div>
  // //   );
  // // }

  // // export default NotesUpload;

  // const renderNote = (note) => {
  //     const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
  //     const statusText = validStatuses.includes(note.status)
  //       ? note.status
  //       : "PENDING";
  //     return (
  //       <div key={note.id} className="list-group-item p-3 shadow-sm">
  //         <div className="d-flex justify-content-between align-items-center">
  //           </div>
  //           <div className="btn-group">
  //             <button
  //               className="btn btn-sm btn-outline-secondary"
  //               onClick={() =>
  //                 setExpandedNoteId(expandedNoteId === note.id ? null : note.id)
  //               }
  //               disabled={note.topics?.length === 0}
  //             >
  //               📄 Details
  //             </button>
  //             <button
  //               className="btn btn-sm btn-outline-success"
  //               onClick={() => loadQuiz(note.id)}
  //               disabled={note.quiz_questions?.length === 0}
  //             >
  //               📝 Take Quiz
  //             </button>
  //             <button
  //               className="btn btn-sm btn-outline-danger"
  //               onClick={() => handleDelete(note.id)}
  //             >
  //               🗑 Delete
  //             </button>
  //           </div>
  //         </div>

  //         {expandedNoteId === note.id && (
  //           <div className="mt-3 border-top pt-3">
  //             <h5 className="fw-bold text-primary mb-3">📘 Summaries</h5>
  //             <div className="row g-3">
  //               {note.topics.map((t, i) => (
  //                 <div className="col-md-4" key={i}>
  //                   <div className="card shadow-sm h-100 border-0 summary-card card-glow">
  //                     <div className="card-header d-flex align-items-center">
  //                       <span className="me-2">📖</span> {t.topic}
  //                     </div>
  //                     <div className="card-body">
  //                       <p className="card-text ">{t.summary}</p>
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>

  //             <hr className="my-4" />

  //             <h5 className="fw-bold text-warning mb-3">💡 Flashcards</h5>
  //             <div className="row g-3">
  //               {note.flashcards && note.flashcards.length > 0 ? (
  //                 note.flashcards.map((f, i) => (
  //                   <div className="col-md-4" key={i}>
  //                     <div className="flashcard-flip">
  //                       <div className="flashcard-inner">
  //                         <div className="flashcard-front">
  //                           <div className="card shadow-sm h-100 border-0 flashcard-card">
  //                             <div className="card-header bg-warning text-dark fw-semibold">
  //                               <span className="me-2">💡</span>{f.term}
  //                             </div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">Hover to see definition</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                         <div className="flashcard-back">
  //                           <div className="card shadow-sm h-100 border-0">
  //                             <div className="card-header bg-warning text-dark fw-semibold">
  //                               {f.term}
  //                             </div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">{f.definition}</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))
  //               ) : (
  //                 <p className="text-muted">No flashcards generated for this note.</p>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     );
  //   };

  //   const renderQuiz = () => (
  //     <div className="card quiz-question my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>🎯 Quiz Time!</h5>
  //         <button className="btn-close" onClick={() => setActiveQuiz(null)}></button>
  //       </div>
  //       <div className="card-body">
  //         {activeQuiz.questions.map((q, i) => (
  //           <div key={q.id} className="mb-4">
  //             <p>
  //               <strong>Question {i + 1}:</strong> {q.question}
  //             </p>
  //             {Object.entries(q.options).map(([key, value]) => (
  //               <div className="form-check" key={key}>
  //                 <input
  //                   className="form-check-input"
  //                   type="radio"
  //                   name={`q-${q.id}`}
  //                   id={`q-${q.id}-opt-${key}`}
  //                   value={key}
  //                   onChange={() =>
  //                     setUserAnswers((prev) => ({ ...prev, [q.id]: key }))
  //                   }
  //                 />
  //                 <label
  //                   className="form-check-label"
  //                   htmlFor={`q-${q.id}-opt-${key}`}
  //                 >
  //                   {value}
  //                 </label>
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //         <button className="btn btn-primary" onClick={handleQuizSubmit}>
  //           🚀 Submit Answers
  //         </button>
  //       </div>
  //     </div>
  //   );

  //   const renderQuizResult = () => (
  //     <div className="card shadow my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>📊 Quiz Result</h5>
  //         <button className="btn-close" onClick={() => setQuizResult(null)}></button>
  //       </div>
  //       <div className="card-body text-center">
  //         <div
  //           className="result-circle"
  //           style={{ "--progress": `${quizResult.score}%` }}
  //         >
  //           <div className="result-circle-inner">{quizResult.score}%</div>
  //         </div>

  //         {quizResult.perTopic && Object.keys(quizResult.perTopic).length > 0 && (
  //           <>
  //             <hr />
  //             <h6 className="fw-semibold">Performance by Topic:</h6>
  //             <ul className="list-unstyled">
  //               {Object.entries(quizResult.perTopic).map(([topic, score]) => (
  //                 <li key={topic}>
  //                   <strong>{topic}:</strong> {score}%
  //                 </li>
  //               ))}
  //             </ul>
  //           </>
  //         )}

  //         <hr />
  //         {quizResult.explanations.map((exp, i) => (
  //           <div
  //             key={i}
  //             className={`p-3 rounded mb-3 ${
  //               exp.isCorrect ? "bg-success-light" : "bg-danger-light"
  //             }`}
  //           >
  //             <p>
  //               <strong>Q: {exp.question}</strong>
  //             </p>
  //             <p>
  //               Your Answer:{" "}
  //               <span className={exp.isCorrect ? "" : "text-danger"}>
  //                 {exp.userAnswer}
  //               </span>
  //             </p>
  //             {!exp.isCorrect && (
  //               <p>
  //                 Correct Answer:{" "}
  //                 <span className="text-success">{exp.correctAnswer}</span>
  //               </p>
  //             )}
  //             {exp.explanation && <p><em>{exp.explanation}</em></p>}
  //             {exp.flashcard && (
  //               <p className="small text-muted">
  //                 💡 Related flashcard: {exp.flashcard.term} —{" "}
  //                 {exp.flashcard.definition}
  //               </p>
  //             )}
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );

  //   return (
  //     <div className="notes-upload-container">
  //       <h2 className="text-center mb-4">📚 Notes Dashboard</h2>

  //       {error && (
  //         <div className="alert alert-danger" onClick={() => setError("")}>
  //           {error}
  //         </div>
  //       )}
  //       {success && (
  //         <div className="alert alert-success" onClick={() => setSuccess("")}>
  //           {success}
  //         </div>
  //       )}

  //       {/* Upload Box */}
  //       <div className="card shadow mb-4">
  //         <div className="card-header">📤 Upload New Note</div>
  //         <div className="card-body text-center">
  //           <div className="upload-box">
  //             <input
  //               type="file"
  //               ref={fileInputRef}
  //               className="form-control mb-3"
  //               onChange={(e) => setFile(e.target.files[0])}
  //               accept=".pdf,.docx,.txt"
  //             />
  //             <button
  //               onClick={handleUpload}
  //               className="btn btn-primary"
  //               disabled={uploading}
  //             >
  //               {uploading ? "⏳ Uploading..." : "🚀 Upload & Process"}
  //             </button>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Notes List / Quiz */}
  //       {activeQuiz
  //         ? renderQuiz()
  //         : quizResult
  //         ? renderQuizResult()
  //         : (
  //           <div className="card shadow">
  //             <div className="card-header">📄 Your Notes</div>
  //             <div className="card-body">
  //               {loadingNotes ? (
  //                 <div className="text-center">
  //                   <div className="spinner-border text-primary"></div>
  //                 </div>
  //               ) : notes.length > 0 ? (
  //                 <div className="list-group">{notes.map(renderNote)}</div>
  //               ) : (
  //                 <p className="text-muted text-center">
  //                   No notes uploaded yet.
  //                 </p>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //     </div>
  //   );
  // }

  // export default NotesUpload;

  // import React, { useState, useEffect, useRef } from "react";
  // import axios from "axios";
  // import { Link, useNavigate } from "react-router-dom";
  // import "bootstrap/dist/css/bootstrap.min.css";
  // import "./NoteUpload.css";

  // function NotesUpload() {
  //   const [file, setFile] = useState(null);
  //   const [notes, setNotes] = useState([]);
  //   const [activeQuiz, setActiveQuiz] = useState(null);
  //   const [userAnswers, setUserAnswers] = useState({});
  //   const [quizResult, setQuizResult] = useState(null);
  //   const [expandedNoteId, setExpandedNoteId] = useState(null);

  //   const [loadingNotes, setLoadingNotes] = useState(true);
  //   const [uploading, setUploading] = useState(false);
  //   const [error, setError] = useState("");
  //   const [success, setSuccess] = useState("");

  //   // NEW: study plan prompt state
  //   const [planChecking, setPlanChecking] = useState(false);
  //   const [planPrompt, setPlanPrompt] = useState(null); // {hasPlan, planId}
  //   const [creatingPlan, setCreatingPlan] = useState(false);

  //   const pollingIntervals = useRef(null);
  //   const fileInputRef = useRef(null);
  //   const navigate = useNavigate();

  //   const token = localStorage.getItem("token");
  //   const headers = { Authorization: `Token ${token}` };
  //   const apiClient = axios.create({ baseURL: "/api", headers });

  //   useEffect(() => {
  //     fetchNotes();
  //     return () => clearInterval(pollingIntervals.current);
  //   }, []);
  //    const goToStudyPlan = (mode, noteIds = []) => {
  //     localStorage.setItem("studyPlanMode", mode);
  //     if (noteIds.length > 0) {
  //       localStorage.setItem("selectedNotes", JSON.stringify(noteIds));
  //     }
  //     navigate("/study-plan");
  //   };
  //   const fetchNotes = async () => {
  //     try {
  //       const res = await apiClient.get("/notes/progress/");
  //       setNotes(res.data);
  //       const processingNote = res.data.find((n) =>
  //         ["PROCESSING", "PENDING"].includes(n.status)
  //       );
  //       if (processingNote && !pollingIntervals.current) {
  //         pollForNoteStatus(processingNote.id);
  //       }
  //     } catch {
  //       setError("❌ Failed to load notes. Please refresh the page.");
  //     } finally {
  //       setLoadingNotes(false);
  //     }
  //   };

  //   const pollForNoteStatus = (noteId) => {
  //     if (pollingIntervals.current) clearInterval(pollingIntervals.current);
  //     pollingIntervals.current = setInterval(async () => {
  //       try {
  //         const res = await apiClient.get(`/notes/${noteId}/status/`);
  //         if (["COMPLETED", "FAILED"].includes(res.data.status)) {
  //           clearInterval(pollingIntervals.current);
  //           pollingIntervals.current = null;
  //           fetchNotes();
  //         } else {
  //           setNotes((prev) =>
  //             prev.map((n) =>
  //               n.id === noteId
  //                 ? {
  //                     ...n,
  //                     ...res.data.data,
  //                     topics: res.data.data.topics || n.topics,
  //                     flashcards: res.data.data.flashcards || n.flashcards,
  //                     quiz_questions: res.data.data.quiz_questions || n.quiz_questions,
  //                     status: res.data.status,
  //                   }
  //                 : n
  //             )
  //           );
  //         }
  //       } catch {
  //         clearInterval(pollingIntervals.current);
  //         pollingIntervals.current = null;
  //         setError("⚠️ Error checking processing status.");
  //       }
  //     }, 5000);
  //   };

  //   const handleUpload = async () => {
  //     if (!file) return setError("📂 Please select a file first.");
  //     setUploading(true);
  //     setError("");
  //     setSuccess("");
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const res = await apiClient.post("/notes/upload/", formData);
  //       setSuccess(res.data.message || "✅ Upload started.");
  //       setNotes((prev) => [
  //         {
  //           id: res.data.note_id,
  //           title: file.name,
  //           status: "PROCESSING",
  //           topics: [],
  //           flashcards: [],
  //           quiz_questions: [],
  //         },
  //         ...prev,
  //       ]);
  //       pollForNoteStatus(res.data.note_id);
  //       setFile(null);
  //       if (fileInputRef.current) fileInputRef.current.value = "";
  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Upload failed. Please try again.");
  //     } finally {
  //       setUploading(false);
  //     }
  //   };

  //   const handleDelete = async (noteId) => {
  //     if (window.confirm("🗑 Are you sure you want to delete this note?")) {
  //       try {
  //         await apiClient.delete(`/notes/${noteId}/delete/`);
  //         setNotes(notes.filter((n) => n.id !== noteId));
  //         setSuccess("✅ Note deleted successfully.");
  //       } catch {
  //         setError("❌ Failed to delete note.");
  //       }
  //     }
  //   };

  //   const loadQuiz = async (noteId) => {
  //     try {
  //       const res = await apiClient.get(`/notes/${noteId}/status/`);
  //       setActiveQuiz({ noteId, questions: res.data.data.quiz_questions || [] });
  //       setUserAnswers({});
  //       setQuizResult(null);
  //       setPlanPrompt(null);
  //     } catch {
  //       setError("❌ Failed to load quiz.");
  //     }
  //   };

  //   const handleQuizSubmit = async () => {
  //     if (!activeQuiz || !activeQuiz.questions) {
  //       return setError("⚠️ No quiz data to submit.");
  //     }
  //     if (Object.keys(userAnswers).length !== activeQuiz.questions.length) {
  //       return setError("⚠️ Please answer all questions before submitting.");
  //     }
  //     setError("");
  //     setPlanPrompt(null);

  //     try {
  //       const res = await apiClient.post(
  //         `/notes/${activeQuiz.noteId}/submit-quiz/`,
  //         { answers: userAnswers }
  //       );
  //       setQuizResult({
  //         score: res.data.score,
  //         perTopic: res.data.per_topic_score || {},
  //         explanations: res.data.explanations || [],
  //       });
  //       setActiveQuiz(null);

  //       // 🔁 Immediately check for latest plan (backend already injected extra resources)
  //       setPlanChecking(true);
  //       try {
  //         const latest = await apiClient.get("/study-plan/latest/");
  //         setPlanPrompt({ hasPlan: true, planId: latest.data.id });
  //       } catch (e) {
  //         // No plan yet — offer to create one with this note
  //         setPlanPrompt({ hasPlan: false, noteId: activeQuiz.noteId });
  //       } finally {
  //         setPlanChecking(false);
  //       }
  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Failed to submit quiz.");
  //     }
  //   };

  //   const createPlanFromNote = async (noteId) => {
  //     setCreatingPlan(true);
  //     setError("");
  //     setSuccess("");
  //     try {
  //       // Instead of generating plan here, just set mode & go to page
  //       goToStudyPlan("note_quiz", [noteId]);
  //     } catch (e) {
  //       setError("❌ Could not create study plan. Please try again.");
  //     } finally {
  //       setCreatingPlan(false);
  //     }
  //   };

  //   const renderNote = (note) => {
  //     const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
  //     const statusText = validStatuses.includes(note.status) ? note.status : "PENDING";
  //     return (
  //       <div key={note.id} className="list-group-item p-3 shadow-sm">
  //         <div className="d-flex justify-content-between align-items-center">
  //           <div>
  //             <h6 className="mb-0 fw-bold">{note.title}</h6>
  //             <small className="text-muted">Status: {statusText}</small>
  //           </div>
  //           <div className="btn-group">
  //             <button
  //               className="btn btn-sm btn-outline-secondary"
  //               onClick={() =>
  //                 setExpandedNoteId(expandedNoteId === note.id ? null : note.id)
  //               }
  //               disabled={note.topics?.length === 0}
  //             >
  //               📄 Details
  //             </button>
  //             <button
  //               className="btn btn-sm btn-outline-success"
  //               onClick={() => loadQuiz(note.id)}
  //               disabled={note.quiz_questions?.length === 0}
  //             >
  //               📝 Take Quiz
  //             </button>
  //              {note.status === "COMPLETED" && (
  //               <button
  //                 className="btn btn-sm btn-outline-primary"
  //                 onClick={() => goToStudyPlan("note_quiz", [note.id])}
  //               >
  //                 📅 Study Plan
  //               </button>
  //             )}
  //             <button
  //               className="btn btn-sm btn-outline-danger"
  //               onClick={() => handleDelete(note.id)}
  //             >
  //               🗑 Delete
  //             </button>
  //           </div>
  //         </div>

  //         {expandedNoteId === note.id && (
  //           <div className="mt-3 border-top pt-3">
  //             <h5 className="fw-bold text-primary mb-3">📘 Summaries</h5>
  //             <div className="row g-3">
  //               {note.topics.map((t, i) => (
  //                 <div className="col-md-4" key={i}>
  //                   <div className="card shadow-sm h-100 border-0 summary-card card-glow">
  //                     <div className="card-header d-flex align-items-center">
  //                       <span className="me-2">📖</span> {t.topic}
  //                     </div>
  //                     <div className="card-body">
  //                       <p className="card-text ">{t.summary}</p>
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>

  //             <hr className="my-4" />

  //             <h5 className="fw-bold text-warning mb-3">💡 Flashcards</h5>
  //             <div className="row g-3">
  //               {note.flashcards && note.flashcards.length > 0 ? (
  //                 note.flashcards.map((f, i) => (
  //                   <div className="col-md-4" key={i}>
  //                     <div className="flashcard-flip">
  //                       <div className="flashcard-inner">
  //                         <div className="flashcard-front">
  //                           <div className="card shadow-sm h-100 border-0 flashcard-card">
  //                             <div className="card-header bg-warning text-dark fw-semibold">
  //                               <span className="me-2">💡</span>
  //                               {f.term}
  //                             </div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">Hover to see definition</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                         <div className="flashcard-back">
  //                           <div className="card shadow-sm h-100 border-0">
  //                             <div className="card-header bg-warning text-dark fw-semibold">
  //                               {f.term}
  //                             </div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">{f.definition}</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))
  //               ) : (
  //                 <p className="text-muted">No flashcards generated for this note.</p>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     );
  //   };

  //   const renderQuiz = () => (
  //     <div className="card quiz-question my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>🎯 Quiz Time!</h5>
  //         <button className="btn-close" onClick={() => setActiveQuiz(null)}></button>
  //       </div>
  //       <div className="card-body">
  //         {activeQuiz.questions.map((q, i) => (
  //           <div key={q.id} className="mb-4">
  //             <p>
  //               <strong>Question {i + 1}:</strong> {q.question}
  //             </p>
  //             {Object.entries(q.options).map(([key, value]) => (
  //               <div className="form-check" key={key}>
  //                 <input
  //                   className="form-check-input"
  //                   type="radio"
  //                   name={`q-${q.id}`}
  //                   id={`q-${q.id}-opt-${key}`}
  //                   value={key}
  //                   onChange={() =>
  //                     setUserAnswers((prev) => ({ ...prev, [q.id]: key }))
  //                   }
  //                 />
  //                 <label className="form-check-label" htmlFor={`q-${q.id}-opt-${key}`}>
  //                   {value}
  //                 </label>
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //         <button className="btn btn-primary" onClick={handleQuizSubmit}>
  //           🚀 Submit Answers
  //         </button>
  //       </div>
  //     </div>
  //   );

  //   const renderQuizResult = () => (
  //     <div className="card shadow my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>📊 Quiz Result</h5>
  //         <button className="btn-close" onClick={() => setQuizResult(null)}></button>
  //       </div>
  //       <div className="card-body text-center">
  //         <div className="result-circle" style={{ "--progress": `${quizResult.score}%` }}>
  //           <div className="result-circle-inner">{quizResult.score}%</div>
  //         </div>

  //         {quizResult.perTopic && Object.keys(quizResult.perTopic).length > 0 && (
  //           <>
  //             <hr />
              
  //             <h6 className="fw-semibold">Performance by Topic:</h6>
  //             <ul className="list-unstyled">
  //               {Object.entries(quizResult.perTopic).map(([topic, score]) => (
  //                 <li key={topic}>
  //                   <strong>{topic}:</strong> {score}%
  //                 </li>
  //               ))}
  //             </ul>
  //           </>
  //         )}

  //         <hr />
  //         {quizResult.explanations.map((exp, i) => (
  //           <div
  //             key={i}
  //             className={`p-3 rounded mb-3 ${
  //               exp.isCorrect ? "bg-success-light" : "bg-danger-light"
  //             }`}
  //           >
  //             <p>
  //               <strong>Q: {exp.question}</strong>
  //             </p>
  //             <p>
  //               Your Answer:{" "}
  //               <span className={exp.isCorrect ? "" : "text-danger"}>
  //                 {exp.userAnswer}
  //               </span>
  //             </p>
  //             {!exp.isCorrect && (
  //               <p>
  //                 Correct Answer: <span className="text-success">{exp.correctAnswer}</span>
  //               </p>
  //             )}
  //             {exp.explanation && <p><em>{exp.explanation}</em></p>}
  //           </div>
  //         ))}

  //         {/* 🔔 Study Plan CTA area */}
  //         <hr />
  // <div className="mt-3">
  //   {planChecking ? (
  //     <div className="d-inline-flex align-items-center">
  //       <div className="spinner-border me-2" role="status" />
  //       <span>Checking your study plan…</span>
  //     </div>
  //   ) : (
  //     <>
  //       <div className="alert alert-info mb-3">
  //         📅 You can turn this quiz result into a personalized study plan.
  //       </div>
  //       <div className="d-flex flex-wrap gap-2 justify-content-center">
  //         <button
  //           className="btn btn-primary"
  //           onClick={() =>
  //             goToStudyPlan("note_quiz", [
  //               planPrompt?.noteId || activeQuiz?.noteId,
  //             ])
  //           }
  //         >
  //           📅 Create Study Plan From This Note
  //         </button>
  //         <Link to="/study-plan" className="btn btn-outline-secondary">
  //           View My Study Plans
  //         </Link>
  //       </div>
  //     </>
  //   )}
  // </div>

  //         </div>
  //     </div>
  //   );

  //   return (
  //     <div className="notes-upload-container">
  //       <h2 className="text-center mb-4">📚 Notes Dashboard</h2>

  //       {error && <div className="alert alert-danger" onClick={() => setError("")}>{error}</div>}
  //       {success && <div className="alert alert-success" onClick={() => setSuccess("")}>{success}</div>}

  //       {/* Upload Box */}
  //       <div className="card shadow mb-4">
  //         <div className="card-header">📤 Upload New Note</div>
  //         <div className="card-body text-center">
  //           <div className="upload-box">
  //             <input
  //               type="file"
  //               ref={fileInputRef}
  //               className="form-control mb-3"
  //               onChange={(e) => setFile(e.target.files[0])}
  //               accept=".pdf,.docx,.txt"
  //             />
  //             <button onClick={handleUpload} className="btn btn-primary" disabled={uploading}>
  //               {uploading ? "⏳ Uploading..." : "🚀 Upload & Process"}
  //             </button>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Notes List / Quiz */}
  //       {activeQuiz
  //         ? renderQuiz()
  //         : quizResult
  //         ? renderQuizResult()
  //         : (
  //           <div className="card shadow">
  //             <div className="card-header">📄 Your Notes</div>
  //             <div className="card-body">
  //               {loadingNotes ? (
  //                 <div className="text-center">
  //                   <div className="spinner-border text-primary"></div>
  //                 </div>
  //               ) : notes.length > 0 ? (
  //                 <div className="list-group">{notes.map(renderNote)}</div>
  //               ) : (
  //                 <p className="text-muted text-center">No notes uploaded yet.</p>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //     </div>
  //   );
  // }

  // export default NotesUpload;
  // import React, { useState, useEffect, useRef } from "react";
  // import axios from "axios";
  // import { Link, useNavigate } from "react-router-dom";
  // import "bootstrap/dist/css/bootstrap.min.css";
  // import "./NoteUpload.css";

  // function NotesUpload() {
  //   const [file, setFile] = useState(null);
  //   const [notes, setNotes] = useState([]);
  //   const [activeQuiz, setActiveQuiz] = useState(null);
  //   const [userAnswers, setUserAnswers] = useState({});
  //   const [quizResult, setQuizResult] = useState(null);
  //   const [expandedNoteId, setExpandedNoteId] = useState(null);

  //   const [loadingNotes, setLoadingNotes] = useState(true);
  //   const [uploading, setUploading] = useState(false);
  //   const [error, setError] = useState("");
  //   const [success, setSuccess] = useState("");

  //   const [planChecking, setPlanChecking] = useState(false);
  //   const [planPrompt, setPlanPrompt] = useState(null);

  //   const pollingIntervals = useRef(null);
  //   const fileInputRef = useRef(null);
  //   const navigate = useNavigate();

  //   const token = localStorage.getItem("token");
  //   const headers = { Authorization: `Token ${token}` };
  //   const apiClient = axios.create({ baseURL: "/api", headers });

  //   useEffect(() => {
  //     fetchNotes();
  //     return () =>Object.values(pollingIntervals.current).forEach(clearInterval);

  //   }, []);

  //   const goToStudyPlan = (mode, noteIds = []) => {
  //     localStorage.setItem("studyPlanMode", mode);
  //     if (noteIds.length > 0) localStorage.setItem("selectedNotes", JSON.stringify(noteIds));
  //     navigate("/study-plan");
  //   };

  //   const fetchNotes = async () => {
  //     try {
  //       const res = await apiClient.get("/notes/progress/");
  //       const safeNotes = res.data.map((n) => ({
  //         ...n,
  //         topics: n.topics || [], //ensure toic array exists
  //         flashcards: n.flashcards || [], // ensure flashcard array exists
  //         quiz_questions: n.quiz_questions || [], // ensure quiz_questions array exists
  //       }));
  //       setNotes(safeNotes); // set notes with safe defaults
  //        // start polling if any notes is still processing or completed but missing details
  //      safeNotes.forEach((note) => {
  //         if (
  //           ["PROCESSING", "PENDING"].includes(note.status) ||
  //           (note.status === "COMPLETED" &&
  //             (note.topics.length === 0 || note.flashcards.length === 0))
  //         ) {
  //           pollForNoteStatus(note.id);
  //         }
  //       });
  //     } catch {
  //       setError("❌ Failed to load notes. Please refresh the page.");
  //     } finally {
  //       setLoadingNotes(false);
  //     }    }
  //   };

  //   // ✅ Updated pollForNoteStatus to handle COMPLETED notes with empty topics/flashcards
  //       const pollForNoteStatus = (noteId) => {
  //     if (pollingIntervals.current[noteId]) clearInterval(pollingIntervals.current[noteId]);

  //     pollingIntervals.current[noteId] = setInterval(async () => {
  //       try {
  //         const res = await apiClient.get(`/notes/${noteId}/status/`);
  //         const noteData = res.data.data || {};
  //         const updatedNote = {
  //           ...noteData,
  //           topics: noteData.topics || [],
  //           flashcards: noteData.flashcards || [],
  //           quiz_questions: noteData.quiz_questions || [],
  //           status: res.data.status,
  //         };
  //       setNotes((prev) =>
  //         prev.map((n) => (n.id === noteId ? { ...n, ...updatedNote } : n))
  //       );

  //       // stop polling only when COMPLETED and details exist OR FAILED
  //       if (
  //         ["FAILED"].includes(res.data.status) ||
  //         (res.data.status === "COMPLETED" &&
  //           updatedNote.topics.length > 0 &&
  //           updatedNote.flashcards.length > 0 &&
  //           updatedNote.quiz_questions.length > 0)
  //       ) {
  //         clearInterval(pollingIntervals.current);
  //         pollingIntervals.current = null;
  //       }
  //     } catch {
  //       clearInterval(pollingIntervals.current);
  //       pollingIntervals.current = null;
  //       setError("⚠️ Error checking processing status.");
  //     }
  //   }, 3000); // <-- faster polling for better UX
  // };
    
  //   const handleUpload = async () => {
  //     if (!file) return setError("📂 Please select a file first.");
  //     setUploading(true);
  //     setError("");
  //     setSuccess("");
  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const res = await apiClient.post("/notes/upload/", formData);
  //       setSuccess(res.data.message || "✅ Upload started.");
  //       setNotes((prev) => [
  //         {
  //           id: res.data.note_id,
  //           title: file.name,
  //           status: "PROCESSING",
  //           topics: [],
  //           flashcards: [],
  //           quiz_questions: [],
  //         },
  //         ...prev,
  //       ]);
  //       pollForNoteStatus(res.data.note_id);
  //       setFile(null);
  //       if (fileInputRef.current) fileInputRef.current.value = "";
  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Upload failed. Please try again.");
  //     } finally {
  //       setUploading(false);
  //     }
  //   };

  //   const handleDelete = async (noteId) => {
  //     if (!window.confirm("🗑 Are you sure you want to delete this note?")) return;
  //     try {
  //       await apiClient.delete(`/notes/${noteId}/delete/`);
  //       setNotes(notes.filter((n) => n.id !== noteId));
  //       setSuccess("✅ Note deleted successfully.");
  //     } catch {
  //       setError("❌ Failed to delete note.");
  //     }
  //   };

  //   const loadQuiz = async (noteId) => {
  //     try {
  //       const res = await apiClient.get(`/notes/${noteId}/status/`);
  //       const quizData = res.data.data?.quiz_questions || [];
  //       setActiveQuiz({ noteId, questions: quizData });
  //       setUserAnswers({});
  //       setQuizResult(null);
  //       setPlanPrompt(null);
  //     } catch {
  //       setError("❌ Failed to load quiz.");
  //     }
  //   };

  //   const handleQuizSubmit = async () => {
  //     if (!activeQuiz || !activeQuiz.questions) return setError("⚠️ No quiz data to submit.");
  //     if (Object.keys(userAnswers).length !== activeQuiz.questions.length)
  //       return setError("⚠️ Please answer all questions before submitting.");

  //     setError("");
  //     setPlanPrompt(null);

  //     try {
  //       const res = await apiClient.post(`/notes/${activeQuiz.noteId}/submit-quiz/`, {
  //         answers: userAnswers,
  //       });
  //       setQuizResult({
  //         score: res.data.score,
  //         perTopic: res.data.per_topic_score || {},
  //         explanations: res.data.explanations || [],
  //       });
  //       setActiveQuiz(null);

  //       // Check for latest plan
  //       setPlanChecking(true);
  //       try {
  //         const latest = await apiClient.get("/study-plan/latest/");
  //         setPlanPrompt({ hasPlan: true, planId: latest.data.id });
  //       } catch {
  //         setPlanPrompt({ hasPlan: false, noteId: activeQuiz.noteId });
  //       } finally {
  //         setPlanChecking(false);
  //       }
  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Failed to submit quiz.");
  //     }
  //   };

  //   const renderNote = (note) => {
  //     const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"];
  //     const statusText = validStatuses.includes(note.status) ? note.status : "PENDING";

  //     return (
  //       <div key={note.id} className="list-group-item p-3 shadow-sm">
  //         <div className="d-flex justify-content-between align-items-center">
  //           <div>
  //             <h6 className="mb-0 fw-bold">{note.title}</h6>
  //             <small className="text-muted">Status: {statusText}</small>
  //           </div>
  //           <div className="btn-group">
  //             <button
  //               className="btn btn-sm btn-outline-secondary"
  //               onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
  //               disabled={(note.topics || []).length === 0}
  //             >
  //               📄 Details
  //             </button>
  //             <button
  //               className="btn btn-sm btn-outline-success"
  //               onClick={() => loadQuiz(note.id)}
  //               disabled={(note.quiz_questions || []).length === 0}
  //             >
  //               📝 Take Quiz
  //             </button>
  //             {note.status === "COMPLETED" && (
  //               <button
  //                 className="btn btn-sm btn-outline-primary"
  //                 onClick={() => goToStudyPlan("note_quiz", [note.id])}
  //               >
  //                 📅 Study Plan
  //               </button>
  //             )}
  //             <button
  //               className="btn btn-sm btn-outline-danger"
  //               onClick={() => handleDelete(note.id)}
  //             >
  //               🗑 Delete
  //             </button>
  //           </div>
  //         </div>

  //         {expandedNoteId === note.id && (
  //           <div className="mt-3 border-top pt-3">
  //             <h5 className="fw-bold text-primary mb-3">📘 Summaries</h5>
  //             <div className="row g-3">
  //               {(note.topics || []).map((t, i) => (
  //                 <div className="col-md-4" key={i}>
  //                   <div className="card shadow-sm h-100 border-0 summary-card card-glow">
  //                     <div className="card-header d-flex align-items-center">
  //                       <span className="me-2">📖</span> {t.topic}
  //                     </div>
  //                     <div className="card-body">
  //                       <p className="card-text">{t.summary}</p>
  //                       {/* ✅ Render resources if provided */}
  //               {t.resources && (
  //                 <div className="mt-2">
  //                   {t.resources.YouTube && (
  //                     <a
  //                       href={t.resources.YouTube}
  //                       target="_blank"
  //                       rel="noreferrer"
  //                       className="btn btn-sm btn-danger me-1"
  //                     >
  //                       YouTube
  //                     </a>
  //                   )}
  //                   {t.resources.Coursera && (
  //                     <a
  //                       href={t.resources.Coursera}
  //                       target="_blank"
  //                       rel="noreferrer"
  //                       className="btn btn-sm btn-primary me-1"
  //                     >
  //                       Coursera
  //                     </a>
  //                   )}
  //                   {t.resources.edX && (
  //                     <a
  //                       href={t.resources.edX}
  //                       target="_blank"
  //                       rel="noreferrer"
  //                       className="btn btn-sm btn-dark"
  //                     >
  //                       edX
  //                     </a>
  //                   )}
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       ))}
  //     </div>

  //             <hr className="my-4" />

  //             <h5 className="fw-bold text-warning mb-3">💡 Flashcards</h5>
  //             <div className="row g-3">
  //               {(note.flashcards || []).length > 0 ? (
  //                 (note.flashcards || []).map((f, i) => (
  //                   <div className="col-md-4" key={i}>
  //                     <div className="flashcard-flip">
  //                       <div className="flashcard-inner">
  //                         <div className="flashcard-front">
  //                           <div className="card shadow-sm h-100 border-0 flashcard-card">
  //                             <div className="card-header bg-warning text-dark fw-semibold">
  //                               <span className="me-2">💡</span>
  //                               {f.term}
  //                             </div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">Hover to see definition</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                         <div className="flashcard-back">
  //                           <div className="card shadow-sm h-100 border-0">
  //                             <div className="card-header bg-warning text-dark fw-semibold">
  //                               {f.term}
  //                             </div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">{f.definition}</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))
  //               ) : (
  //                 <p className="text-muted">No flashcards generated for this note.</p>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     );
  //   };

  //   const renderQuiz = () => (
  //     <div className="card quiz-question my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>🎯 Quiz Time!</h5>
  //         <button className="btn-close" onClick={() => setActiveQuiz(null)}></button>
  //       </div>
  //       <div className="card-body">
  //         {activeQuiz.questions.map((q, i) => (
  //           <div key={q.id} className="mb-4">
  //             <p>
  //               <strong>Question {i + 1}:</strong> {q.question}
  //             </p>
  //             {Object.entries(q.options || {}).map(([key, value]) => (
  //               <div className="form-check" key={key}>
  //                 <input
  //                   className="form-check-input"
  //                   type="radio"
  //                   name={`q-${q.id}`}
  //                   id={`q-${q.id}-opt-${key}`}
  //                   value={key}
  //                   onChange={() =>
  //                     setUserAnswers((prev) => ({ ...prev, [q.id]: key }))
  //                   }
  //                 />
  //                 <label className="form-check-label" htmlFor={`q-${q.id}-opt-${key}`}>
  //                   {value}
  //                 </label>
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //         <button className="btn btn-primary" onClick={handleQuizSubmit}>
  //           🚀 Submit Answers
  //         </button>
  //       </div>
  //     </div>
  //   );

  //   const renderQuizResult = () => (
  //     <div className="card shadow my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>📊 Quiz Result</h5>
  //         <button className="btn-close" onClick={() => setQuizResult(null)}></button>
  //       </div>
  //       <div className="card-body text-center">
  //         <div className="result-circle" style={{ "--progress": `${quizResult.score}%` }}>
  //           <div className="result-circle-inner">{quizResult.score}%</div>
  //         </div>

  //         {quizResult.perTopic && Object.keys(quizResult.perTopic).length > 0 && (
  //           <>
  //             <hr />
  //             <h6 className="fw-semibold">Performance by Topic:</h6>
  //             <ul className="list-unstyled">
  //               {Object.entries(quizResult.perTopic).map(([topic, score]) => (
  //                 <li key={topic}>
  //                   <strong>{topic}:</strong> {score}%
  //                 </li>
  //               ))}
  //             </ul>
  //           </>
  //         )}

  //         <hr />
  //         {(quizResult.explanations || []).map((exp, i) => (
  //           <div
  //             key={i}
  //             className={`p-3 rounded mb-3 ${
  //               exp.isCorrect ? "bg-success-light" : "bg-danger-light"
  //             }`}
  //           >
  //             <p>
  //               <strong>Q: {exp.question}</strong>
  //             </p>
  //             <p>
  //               Your Answer:{" "}
  //               <span className={exp.isCorrect ? "" : "text-danger"}>{exp.userAnswer}</span>
  //             </p>
  //             {!exp.isCorrect && (
  //               <p>
  //                 Correct Answer: <span className="text-success">{exp.correctAnswer}</span>
  //               </p>
  //             )}
  //             {exp.explanation && <p><em>{exp.explanation}</em></p>}
  //           </div>
  //         ))}

  //         <hr />
  //         <div className="mt-3">
  //           {planChecking ? (
  //             <div className="d-inline-flex align-items-center">
  //               <div className="spinner-border me-2" role="status" />
  //               <span>Checking your study plan…</span>
  //             </div>
  //           ) : (
  //             <>
  //               <div className="alert alert-info mb-3">
  //                 📅 You can turn this quiz result into a personalized study plan.
  //               </div>
  //               <div className="d-flex flex-wrap gap-2 justify-content-center">
  //                 <button
  //                   className="btn btn-primary"
  //                   onClick={() =>
  //                     goToStudyPlan("note_quiz", [
  //                       planPrompt?.noteId || activeQuiz?.noteId,
  //                     ])
  //                   }
  //                 >
  //                   📅 Create Study Plan From This Note
  //                 </button>
  //                 <Link to="/study-plan" className="btn btn-outline-secondary">
  //                   View My Study Plans
  //                 </Link>
  //               </div>
  //             </>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );

  //   return (
  //     <div className="notes-upload-container">
  //       <h2 className="text-center mb-4">📚 Notes Dashboard</h2>

  //       {error && <div className="alert alert-danger" onClick={() => setError("")}>{error}</div>}
  //       {success && <div className="alert alert-success" onClick={() => setSuccess("")}>{success}</div>}

  //       {/* Upload Box */}
  //       <div className="card shadow mb-4">
  //         <div className="card-header">📤 Upload New Note</div>
  //         <div className="card-body text-center">
  //           <div className="upload-box">
  //             <input
  //               type="file"
  //               ref={fileInputRef}
  //               className="form-control mb-3"
  //               onChange={(e) => setFile(e.target.files[0])}
  //               accept=".pdf,.docx,.txt"
  //             />
  //             <button onClick={handleUpload} className="btn btn-primary" disabled={uploading}>
  //               {uploading ? "⏳ Uploading..." : "🚀 Upload & Process"}
  //             </button>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Notes List / Quiz */}
  //       {activeQuiz
  //         ? renderQuiz()
  //         : quizResult
  //         ? renderQuizResult()
  //         : (
  //           <div className="card shadow">
  //             <div className="card-header">📄 Your Notes</div>
  //             <div className="card-body">
  //               {loadingNotes ? (
  //                 <div className="text-center">
  //                   <div className="spinner-border text-primary"></div>
  //                 </div>
  //               ) : notes.length > 0 ? (
  //                 <div className="list-group">{notes.map(renderNote)}</div>
  //               ) : (
  //                 <p className="text-muted text-center">No notes uploaded yet.</p>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //     </div>
  //   );
  // }

  // export default NotesUpload;
  // import React, { useEffect, useState, useRef } from "react";
  // import { useNavigate, Link } from "react-router-dom";
  // import axios from "axios";
  // import "bootstrap/dist/css/bootstrap.min.css";
  // import "./NoteUpload.css";

  // function NotesUpload() {
  //   const [file, setFile] = useState(null);
  //   const [notes, setNotes] = useState([]);
  //   const [activeQuiz, setActiveQuiz] = useState(null);
  //   const [userAnswers, setUserAnswers] = useState({});
  //   const [quizResult, setQuizResult] = useState(null);
  //   const [expandedNoteId, setExpandedNoteId] = useState(null);

  //   const [loadingNotes, setLoadingNotes] = useState(true);
  //   const [uploading, setUploading] = useState(false);
  //   const [error, setError] = useState("");
  //   const [success, setSuccess] = useState("");

  //   const [planChecking, setPlanChecking] = useState(false);
  //   const [planPrompt, setPlanPrompt] = useState(null);

  //   const pollingIntervals = useRef({});
  //   const fileInputRef = useRef(null);
  //   const navigate = useNavigate();

  //   const token = localStorage.getItem("token");
  //   const headers = { Authorization: `Token ${token}` };
  //   const apiClient = axios.create({ baseURL: "/api", headers });

  //   // --- Fetch Notes on mount ---
  //   useEffect(() => {
  //     fetchNotes();
  //     return () => {
  //       Object.values(pollingIntervals.current).forEach(clearInterval);
  //     };
  //   }, []);

  //   const fetchNotes = async () => {
  //     try {
  //       const res = await apiClient.get("/notes/progress/");
  //       const safeNotes = res.data.map((n) => ({
  //         ...n,
  //         topics: n.topics || [],
  //         flashcards: n.flashcards || [],
  //         quiz_questions: n.quiz_questions || [],
  //       }));
  //       setNotes(safeNotes);

  //       // Poll any incomplete notes
  //       safeNotes.forEach((note) => {
  //         if (
  //           ["PROCESSING", "PENDING"].includes(note.status) ||
  //           (note.status === "COMPLETED" &&
  //             (note.topics.length === 0 || note.flashcards.length === 0))
  //         ) {
  //           pollForNoteStatus(note.id);
  //         }
  //       });
  //     } catch {
  //       setError("❌ Failed to load notes. Please refresh.");
  //     } finally {
  //       setLoadingNotes(false);
  //     }
  //   };

  //   // --- Polling function per note ---
  //   // --- Polling function per note ---
  // const pollForNoteStatus = (noteOrId) => {
  //   const noteId = typeof noteOrId === "object" ? noteOrId.id : noteOrId;

  //   if (!noteId) return; // safeguard

  //   if (pollingIntervals.current[noteId]) {
  //     clearInterval(pollingIntervals.current[noteId]);
  //   }

  //   pollingIntervals.current[noteId] = setInterval(async () => {
  //     try {
  //       const res = await apiClient.get(`/notes/${noteId}/status/`);
  //       const noteData = res.data.data || {};
  //       const updatedNote = {
  //         ...noteData,
  //         topics: noteData.topics || [],
  //         flashcards: noteData.flashcards || [],
  //         quiz_questions: noteData.quiz_questions || [],
  //         status: res.data.status,
  //       };

  //       setNotes((prev) =>
  //         prev.map((n) =>
  //           n.id === noteId
  //             ? {
  //                 ...n,
  //                 status: res.data.status || n.status,
  //                 topics: updatedNote.topics.length > 0 ? updatedNote.topics : n.topics,
  //                 flashcards: updatedNote.flashcards.length > 0 ? updatedNote.flashcards : n.flashcards,
  //                 quiz_questions:
  //                   updatedNote.quiz_questions.length > 0 ? updatedNote.quiz_questions : n.quiz_questions,
  //               }
  //             : n
  //         )
  //       );

  //       if (
  //         ["FAILED"].includes(res.data.status) ||
  //         (res.data.status === "COMPLETED" &&
  //           updatedNote.topics.length > 0 &&
  //           updatedNote.flashcards.length > 0 &&
  //           updatedNote.quiz_questions.length > 0)
  //       ) {
  //         clearInterval(pollingIntervals.current[noteId]);
  //         delete pollingIntervals.current[noteId];
  //       }
  //     } catch {
  //       clearInterval(pollingIntervals.current[noteId]);
  //       delete pollingIntervals.current[noteId];
  //       setError("⚠️ Error checking note status.");
  //     }
  //   }, 2500);
  // };


  //   // --- File Upload ---
  //   const handleUpload = async () => {
  //     if (!file) return setError("📂 Please select a file first.");
  //     setUploading(true);
  //     setError("");
  //     setSuccess("");

  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const res = await apiClient.post("/notes/upload/", formData);
  //       setSuccess(res.data.message || "✅ Upload started.");
  //       const newNote = {
  //         id: res.data.note,
  //         title: file.name,
  //         status: "PROCESSING",
  //         topics: [],
  //         flashcards: [],
  //         quiz_questions: [],
  //       };
  //       setNotes((prev) => [newNote, ...prev]);
  //       pollForNoteStatus(newNote.id);
  //       setFile(null);
  //       if (fileInputRef.current) fileInputRef.current.value = "";
  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Upload failed.");
  //     } finally {
  //       setUploading(false);
  //     }
  //   };

  //   // --- Delete Note ---
  //   const handleDelete = async (noteId) => {
  //     if (!window.confirm("🗑 Are you sure you want to delete this note?")) return;
  //     try {
  //       await apiClient.delete(`/notes/${noteId}/delete/`);
  //       setNotes(notes.filter((n) => n.id !== noteId));
  //       setSuccess("✅ Note deleted successfully.");
  //       if (pollingIntervals.current[noteId]) {
  //         clearInterval(pollingIntervals.current[noteId]);
  //         delete pollingIntervals.current[noteId];
  //       }
  //     } catch {
  //       setError("❌ Failed to delete note.");
  //     }
  //   };

  //   // --- Load Quiz ---
  //   // const loadQuiz = async (noteId) => {
  //   //   try {
  //   //     const res = await apiClient.get(`/notes/${noteId}/status/`);
  //   //     const quizData = res.data.data?.quiz_questions || [];
  //   //     setActiveQuiz({ noteId, questions: quizData });
  //   //     setUserAnswers({});
  //   //     setQuizResult(null);
  //   //     setPlanPrompt(null);
  //   //   } catch {
  //   //     setError("❌ Failed to load quiz.");
  //   //   }
  //   // };
  //   const loadQuiz = (noteId) => {
  //   const note = notes.find((n) => n.id === noteId);
  //   if (!note) {
  //     setError("⚠️ Note not found.");
  //     return;
  //   }

  //   if (!note.quiz_questions || note.quiz_questions.length === 0) {
  //     setError("⚠️ No quiz available for this note yet.");
  //     return;
  //   }

  //   setActiveQuiz({ noteId, questions: note.quiz_questions });
  //   setUserAnswers({});
  //   setQuizResult(null);
  //   setPlanPrompt(null);
  // };


  //   // --- Submit Quiz ---
  //   const handleQuizSubmit = async () => {
  //     if (!activeQuiz || !activeQuiz.questions) return setError("⚠️ No quiz data to submit.");
  //     if (Object.keys(userAnswers).length !== activeQuiz.questions.length)
  //       return setError("⚠️ Please answer all questions before submitting.");

  //     setError("");
  //     setPlanPrompt(null);

  //     try {
  //       const res = await apiClient.post(`/notes/${activeQuiz.noteId}/submit-quiz/`, {
  //         answers: userAnswers,
  //       });
  //       setQuizResult({
  //         score: res.data.score,
  //         perTopic: res.data.per_topic_score || {},
  //         explanations: res.data.explanations || [],
  //       });
  //       setActiveQuiz(null);

  //       // Check latest study plan
  //       setPlanChecking(true);
  //       try {
  //         const latest = await apiClient.get("/study-plan/latest/");
  //         setPlanPrompt({ hasPlan: true, planId: latest.data.id });
  //       } catch {
  //         setPlanPrompt({ hasPlan: false, noteId: activeQuiz.noteId });
  //       } finally {
  //         setPlanChecking(false);
  //       }
  //     } catch (err) {
  //       setError(err.response?.data?.error || "❌ Failed to submit quiz.");
  //     }
  //   };

  //   // --- Navigate to Study Plan ---
  //   const goToStudyPlan = (mode, noteIds = []) => {
  //     localStorage.setItem("studyPlanMode", mode);
  //     if (noteIds.length > 0) localStorage.setItem("selectedNotes", JSON.stringify(noteIds));
  //     navigate("/study-plan");
  //   };

  //   // --- Render Note ---
  //   const renderNote = (note) => {
  //     const statusText = ["PENDING","PROCESSING","COMPLETED","FAILED"].includes(note.status) ? note.status : "PENDING";

  //     return (
  //       <div key={note.id} className="list-group-item p-3 shadow-sm">
  //         <div className="d-flex justify-content-between align-items-center">
  //           <div>
  //             <h6 className="mb-0 fw-bold">{note.title}</h6>
  //             <small className="text-muted">Status: {statusText}</small>
  //           </div>
  //           <div className="btn-group">
  //             <button
  //               className="btn btn-sm btn-outline-secondary"
  //               onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
  //               disabled={note.status !=="COMPLETED" }
  //             >
  //               📄 Details
  //             </button>
  //             <button
  //               className="btn btn-sm btn-outline-success"
  //               onClick={() => loadQuiz(note.id)}
  //               disabled={note.status !=="COMPLETED" }
  //             >
  //               📝 Take Quiz
  //             </button>
  //             {note.status === "COMPLETED" && (
  //               <button
  //                 className="btn btn-sm btn-outline-primary"
  //                 onClick={() => goToStudyPlan("note_quiz", [note.id])}
  //               >
  //                 📅 Study Plan
  //               </button>
  //             )}
  //             <button
  //               className="btn btn-sm btn-outline-danger"
  //               onClick={() => handleDelete(note.id)}
  //             >
  //               🗑 Delete
  //             </button>
  //           </div>
  //         </div>

  //         {expandedNoteId === note.id && (
  //           <div className="mt-3 border-top pt-3">
  //             {/* Topics / Summaries */}
  //             <h5 className="fw-bold text-primary mb-3">📘 Summaries</h5>
  //             <div className="row g-3">
  //               {(note.topics || []).map((t, i) => (
  //                 <div className="col-md-4" key={i}>
  //                   <div className="card shadow-sm h-100 border-0 summary-card card-glow">
  //                     <div className="card-header d-flex align-items-center">
  //                       <span className="me-2">📖</span> {t.topic}
  //                     </div>
  //                     <div className="card-body">
  //                       <p>{t.summary}</p>
  //                       {t.resources && (
  //                         <div className="mt-2">
  //                           {t.resources.YouTube && <a href={t.resources.YouTube} target="_blank" rel="noreferrer" className="btn btn-sm btn-danger me-1">YouTube</a>}
  //                           {t.resources.Coursera && <a href={t.resources.Coursera} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary me-1">Coursera</a>}
  //                           {t.resources.edX && <a href={t.resources.edX} target="_blank" rel="noreferrer" className="btn btn-sm btn-dark">edX</a>}
  //                         </div>
  //                       )}
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>

  //             {/* Flashcards */}
  //             <hr className="my-4" />
  //             <h5 className="fw-bold text-warning mb-3">💡 Flashcards</h5>
  //             <div className="row g-3">
  //               {(note.flashcards || []).length > 0 ? (
  //                 (note.flashcards || []).map((f, i) => (
  //                   <div className="col-md-4" key={i}>
  //                     <div className="flashcard-flip">
  //                       <div className="flashcard-inner">
  //                         <div className="flashcard-front">
  //                           <div className="card shadow-sm h-100 border-0 flashcard-card">
  //                             <div className="card-header bg-warning text-dark fw-semibold">
  //                               💡 {f.term}
  //                             </div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">Hover to see definition</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                         <div className="flashcard-back">
  //                           <div className="card shadow-sm h-100 border-0">
  //                             <div className="card-header bg-warning text-dark fw-semibold">{f.term}</div>
  //                             <div className="card-body d-flex align-items-center justify-content-center">
  //                               <p className="m-0 text-secondary">{f.definition}</p>
  //                             </div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 ))
  //               ) : (
  //                 <p className="text-muted">No flashcards generated yet.</p>
  //               )}
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     );
  //   };

  //   // --- Render Quiz ---
  //   const renderQuiz = () => (
  //     <div className="card quiz-question my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>🎯 Quiz Time!</h5>
  //         <button className="btn-close" onClick={() => setActiveQuiz(null)}></button>
  //       </div>
  //       <div className="card-body">
  //         {activeQuiz.questions.map((q, i) => (
  //           <div key={q.id} className="mb-4">
  //             <p><strong>Question {i + 1}:</strong> {q.question}</p>
  //             {Object.entries(q.options || {}).map(([key, value]) => (
  //               <div className="form-check" key={key}>
  //                 <input
  //                   className="form-check-input"
  //                   type="radio"
  //                   name={`q-${q.id}`}
  //                   id={`q-${q.id}-opt-${key}`}
  //                   value={key}
  //                   onChange={() => setUserAnswers((prev) => ({ ...prev, [q.id]: key }))}
  //                 />
  //                 <label className="form-check-label" htmlFor={`q-${q.id}-opt-${key}`}>
  //                   {value}
  //                 </label>
  //               </div>
  //             ))}
  //           </div>
  //         ))}
  //         <button className="btn btn-primary" onClick={handleQuizSubmit}>🚀 Submit Answers</button>
  //       </div>
  //     </div>
  //   );

  //   // --- Render Quiz Result ---
  //   const renderQuizResult = () => (
  //     <div className="card shadow my-4">
  //       <div className="card-header d-flex justify-content-between">
  //         <h5>📊 Quiz Result</h5>
  //         <button className="btn-close" onClick={() => setQuizResult(null)}></button>
  //       </div>
  //       <div className="card-body text-center">
  //         <div className="result-circle" style={{ "--progress": `${quizResult.score}%` }}>
  //           <div className="result-circle-inner">{quizResult.score}%</div>
  //         </div>

  //         {quizResult.perTopic && Object.keys(quizResult.perTopic).length > 0 && (
  //           <>
  //             <hr />
  //             <h6 className="fw-semibold">Performance by Topic:</h6>
  //             <ul className="list-unstyled">
  //               {Object.entries(quizResult.perTopic).map(([topic, score]) => (
  //                 <li key={topic}><strong>{topic}:</strong> {score}%</li>
  //               ))}
  //             </ul>
  //           </>
  //         )}

  //         <hr />
  //       {(quizResult.explanations || []).map((exp, i) => (
  //   <div
  //     key={i}
  //     className={`p-3 rounded mb-3 ${exp.isCorrect ? "bg-success-light" : "bg-danger-light"}`}
  //   >
  //     <p className="fw-bold">
  //       Q{i + 1}: {exp.question}{" "}
  //       {exp.isCorrect ? (
  //         <span className="text-success ms-2">✔️</span>
  //       ) : (
  //         <span className="text-danger ms-2">❌</span>
  //       )}
  //     </p>

  //     <p>
  //       Your Answer:{" "}
  //       <span className={exp.isCorrect ? "text-success fw-semibold" : "text-danger fw-semibold"}>
  //         {exp.userAnswer}
  //       </span>
  //     </p>

  //     <p>
  //       Correct Answer:{" "}
  //       <span className="text-success fw-bold">{exp.correctAnswer}</span>
  //     </p>

  //     {exp.explanation && (
  //       <p className="mt-2"><em>💡 {exp.explanation}</em></p>
  //     )}
  //   </div>
  // ))}

  //         <hr />
  //         <div className="mt-3">
  //           {planChecking ? (
  //             <div className="d-inline-flex align-items-center">
  //               <div className="spinner-border me-2" role="status" />
  //               <span>Checking your study plan…</span>
  //             </div>
  //           ) : (
  //             <>
  //               <div className="alert alert-info mb-3">📅 You can turn this quiz result into a personalized study plan.</div>
  //               <div className="d-flex flex-wrap gap-2 justify-content-center">
  //                 <button
  //                   className="btn btn-primary"
  //                   onClick={() => goToStudyPlan("note_quiz", [planPrompt?.noteId || activeQuiz?.noteId])}
  //                 >
  //                   📅 Create Study Plan
  //                 </button>
  //                 <Link to="/study-plan" className="btn btn-outline-secondary">View My Study Plans</Link>
  //               </div>
  //             </>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );

  //   return (
  //     <div className="notes-upload-container">
  //       <h2 className="text-center mb-4">📚 Notes Dashboard</h2>

  //       {error && <div className="alert alert-danger" onClick={() => setError("")}>{error}</div>}
  //       {success && <div className="alert alert-success" onClick={() => setSuccess("")}>{success}</div>}

  //       {/* Upload Box */}
  //       <div className="card shadow mb-4">
  //         <div className="card-header">📤 Upload New Note</div>
  //         <div className="card-body text-center">
  //           <div className="upload-box">
  //             <input
  //               type="file"
  //               ref={fileInputRef}
  //               className="form-control mb-3"
  //               onChange={(e) => setFile(e.target.files[0])}
  //               accept=".pdf,.docx,.txt"
  //             />
  //             <button onClick={handleUpload} className="btn btn-primary" disabled={uploading}>
  //               {uploading ? "⏳ Uploading..." : "🚀 Upload & Process"}
  //             </button>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Notes List / Quiz */}
  //       {activeQuiz ? renderQuiz() : quizResult ? renderQuizResult() : (
  //         <div className="card shadow">
  //           <div className="card-header">📄 Your Notes</div>
  //           <div className="card-body">
  //             {loadingNotes ? (
  //               <div className="text-center">
  //                 <div className="spinner-border text-primary"></div>
  //               </div>
  //             ) : notes.length > 0 ? (
  //               <div className="list-group">{notes.map(renderNote)}</div>
  //             ) : (
  //               <p className="text-muted text-center">No notes uploaded yet.</p>
  //             )}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   );
  // }

  // export default NotesUpload;
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "./Api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./NoteUpload.css";

function NotesUpload() {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [planChecking, setPlanChecking] = useState(false);
  const [planPrompt, setPlanPrompt] = useState(null);

  const pollingIntervals = useRef({});
  const autoQuizHandledRef = useRef(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notes on mount; clear all polls on unmount
  useEffect(() => {
    fetchNotes();
    const intervals = pollingIntervals.current;
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/api/notes/progress/");
      const safeNotes = res.data.map((n) => ({
        ...n,
        topics: n.topics || [],
        flashcards: n.flashcards || [],
        quiz_questions: n.quiz_questions || [],
      }));
      setNotes(safeNotes);
      // Start polling for any notes still being processed
      safeNotes.forEach((note) => {
        if (["PROCESSING", "PENDING"].includes(note.status)) {
          pollForNoteStatus(note.id);
        }
      });
    } catch {
      setError("❌ Failed to load notes. Please refresh.");
    } finally {
      setLoadingNotes(false);
    }
  };

  // ✅ FIX: always extract noteId as a plain number — never pass the whole object
  const pollForNoteStatus = (noteOrId) => {
    // Guard: if someone accidentally passes the full note object, extract .id
    const noteId = typeof noteOrId === "object" && noteOrId !== null
      ? noteOrId.id
      : noteOrId;

    if (!noteId || typeof noteId !== "number") {
      console.warn("[Poll] Invalid noteId:", noteId);
      return;
    }

    // Clear any existing interval for this note
    if (pollingIntervals.current[noteId]) {
      clearInterval(pollingIntervals.current[noteId]);
    }

    // ✅ Poll every 5 seconds (was 2.5s — too fast, caused Gemini 429 rate limits)
    pollingIntervals.current[noteId] = setInterval(async () => {
      try {
        const res = await api.get(`/api/notes/${noteId}/status/`);
        const noteData = res.data.data || {};
        const updatedNote = {
          ...noteData,
          topics: noteData.topics || [],
          flashcards: noteData.flashcards || [],
          quiz_questions: noteData.quiz_questions || [],
          status: res.data.status,
        };

        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  status: res.data.status || n.status,
                  topics: updatedNote.topics.length > 0 ? updatedNote.topics : n.topics,
                  flashcards: updatedNote.flashcards.length > 0 ? updatedNote.flashcards : n.flashcards,
                  quiz_questions:
                    updatedNote.quiz_questions.length > 0 ? updatedNote.quiz_questions : n.quiz_questions,
                }
              : n
          )
        );

        // Stop polling when done
        const isDone =
          res.data.status === "FAILED" ||
          (res.data.status === "COMPLETED" &&
            updatedNote.topics.length > 0 &&
            updatedNote.flashcards.length > 0 &&
            updatedNote.quiz_questions.length > 0);

        if (isDone) {
          clearInterval(pollingIntervals.current[noteId]);
          delete pollingIntervals.current[noteId];
          if (res.data.status === "COMPLETED") {
            setSuccess("✅ Note processed! Topics, flashcards, and quiz are ready.");
          } else {
            setError("⚠️ Note processing failed. Please try uploading again.");
          }
        }
      } catch {
        clearInterval(pollingIntervals.current[noteId]);
        delete pollingIntervals.current[noteId];
      }
    }, 5000); // ✅ 5 seconds — reduced from 2.5s to avoid Gemini 429 errors
  };

  // File upload
  const handleUpload = async () => {
    if (!file) return setError("📂 Please select a file first.");
    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/notes/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.message || "✅ Upload started. Processing in background...");

      // ✅ FIX: backend returns res.data.note.id — extract the numeric id correctly
      const noteId = res.data.note?.id;
      if (!noteId) {
        console.error("[Upload] No note id in response:", res.data);
        setError("⚠️ Upload succeeded but couldn't track status. Please refresh.");
        return;
      }

      const newNote = {
        id: noteId,                        // ✅ plain number
        title: res.data.note?.title || file.name,
        status: "PROCESSING",
        topics: [],
        flashcards: [],
        quiz_questions: [],
      };

      setNotes((prev) => [newNote, ...prev]);
      pollForNoteStatus(noteId);           // ✅ pass plain number
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.response?.data?.error || "❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Delete note
  const handleDelete = async (noteId) => {
    if (!window.confirm("🗑 Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/api/notes/${noteId}/delete/`);
      setNotes(notes.filter((n) => n.id !== noteId));
      setSuccess("✅ Note deleted successfully.");
      if (pollingIntervals.current[noteId]) {
        clearInterval(pollingIntervals.current[noteId]);
        delete pollingIntervals.current[noteId];
      }
    } catch {
      setError("❌ Failed to delete note.");
    }
  };

  // Load quiz from note's already-fetched quiz_questions
  const loadQuiz = (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return setError("⚠️ Note not found.");
    if (!note.quiz_questions || note.quiz_questions.length === 0)
      return setError("⚠️ No quiz available yet. Please wait for processing to complete.");
    setActiveQuiz({ noteId, questions: note.quiz_questions });
    setUserAnswers({});
    setQuizResult(null);
    setPlanPrompt(null);
  };

  // Open a note quiz directly when arriving from Study Plan.
  useEffect(() => {
    if (autoQuizHandledRef.current || loadingNotes) return;

    const params = new URLSearchParams(window.location.search);
    const shouldOpenQuiz = params.get("openQuiz") === "1";
    const noteIdParam = Number(params.get("noteId"));

    if (!shouldOpenQuiz || !Number.isFinite(noteIdParam) || noteIdParam <= 0) {
      autoQuizHandledRef.current = true;
      return;
    }

    const note = notes.find((n) => n.id === noteIdParam);
    if (!note) {
      setError("⚠️ Could not find that note. Please open quiz from Notes list.");
      autoQuizHandledRef.current = true;
      navigate("/notes-upload", { replace: true });
      return;
    }

    if (note.status !== "COMPLETED") {
      setError("⚠️ That note is still processing. Try quiz after processing completes.");
      autoQuizHandledRef.current = true;
      navigate("/notes-upload", { replace: true });
      return;
    }

    if (!Array.isArray(note.quiz_questions) || note.quiz_questions.length === 0) {
      setError("⚠️ Quiz is not available for this note yet.");
      autoQuizHandledRef.current = true;
      navigate("/notes-upload", { replace: true });
      return;
    }

    loadQuiz(noteIdParam);
    autoQuizHandledRef.current = true;
    navigate("/notes-upload", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingNotes, notes, navigate]);

  // Submit quiz
  const handleQuizSubmit = async () => {
    if (!activeQuiz || !activeQuiz.questions)
      return setError("⚠️ No quiz data to submit.");
    if (Object.keys(userAnswers).length !== activeQuiz.questions.length)
      return setError("⚠️ Please answer all questions before submitting.");

    setError("");
    setPlanPrompt(null);

    try {
      const res = await api.post(`/api/notes/${activeQuiz.noteId}/submit-quiz/`, {
        answers: userAnswers,
      });
      setQuizResult({
        score: res.data.score,
        perTopic: res.data.per_topic_score || {},
        explanations: res.data.explanations || [],
      });
      setActiveQuiz(null);

      setPlanChecking(true);
      try {
        const latest = await api.get("/api/study-plan/latest/");
        setPlanPrompt({ hasPlan: true, planId: latest.data.id });
      } catch {
        setPlanPrompt({ hasPlan: false, noteId: activeQuiz.noteId });
      } finally {
        setPlanChecking(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "❌ Failed to submit quiz.");
    }
  };

  const goToStudyPlan = (mode, noteIds = []) => {
    localStorage.setItem("studyPlanMode", mode);
    if (noteIds.length > 0)
      localStorage.setItem("selectedNotes", JSON.stringify(noteIds));
    navigate("/study-plan");
  };

  // ─── Render individual note row ───
  const renderNote = (note) => {
    const statusText = ["PENDING", "PROCESSING", "COMPLETED", "FAILED"].includes(note.status)
      ? note.status
      : "PENDING";
    const isProcessing = ["PENDING", "PROCESSING"].includes(note.status);

    return (
      <div key={note.id} className="list-group-item p-3 shadow-sm mb-2 rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="mb-0 fw-bold">{note.title}</h6>
            <small className={`text-${statusText === "COMPLETED" ? "success" : statusText === "FAILED" ? "danger" : "warning"}`}>
              {isProcessing && (
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
              )}
              {statusText}
            </small>
          </div>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
              disabled={note.status !== "COMPLETED"}
            >
              📄 Details
            </button>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() => loadQuiz(note.id)}
              disabled={note.status !== "COMPLETED"}
            >
              🎯 Quiz
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete(note.id)}
            >
              🗑 Delete
            </button>
          </div>
        </div>

        {/* Expanded details: topics, flashcards, quiz count */}
        {expandedNoteId === note.id && note.status === "COMPLETED" && (
          <div className="mt-3 border-top pt-3">

            {/* Topics */}
            {(note.topics || []).length > 0 && (
              <>
                <h6 className="text-info fw-bold">📖 Topics</h6>
                <div className="row g-2 mb-3">
                  {note.topics.map((t, i) => (
                    <div className="col-md-4" key={i}>
                      <div className="card shadow-sm h-100 summary-card">
                        <div className="card-header">{t.topic}</div>
                        <div className="card-body">
                          <p className="small mb-0">{t.summary}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Flashcards */}
            {(note.flashcards || []).length > 0 && (
              <>
                <h6 className="text-warning fw-bold">💡 Flashcards</h6>
                <div className="row g-2 mb-3">
                  {note.flashcards.map((f, i) => (
                    <div className="col-md-4" key={i}>
                      <div className="flashcard-flip">
                        <div className="flashcard-inner">
                          <div className="flashcard-front">
                            <div className="card shadow-sm h-100 border-0 flashcard-card">
                              <div className="card-header bg-warning text-dark fw-semibold">
                                💡 {f.term}
                              </div>
                              <div className="card-body d-flex align-items-center justify-content-center">
                                <p className="m-0 text-secondary small">Hover to see definition</p>
                              </div>
                            </div>
                          </div>
                          <div className="flashcard-back">
                            <div className="card shadow-sm h-100 border-0">
                              <div className="card-header bg-warning text-dark fw-semibold">{f.term}</div>
                              <div className="card-body d-flex align-items-center justify-content-center">
                                <p className="m-0 text-secondary small">
                                  {f.definition || "No definition available"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Quiz count */}
            {(note.quiz_questions || []).length > 0 && (
              <p className="text-muted small">
                <i className="bi bi-question-circle me-1"></i>
                {note.quiz_questions.length} quiz question{note.quiz_questions.length !== 1 ? "s" : ""} ready.
                <button className="btn btn-link btn-sm p-0 ms-2" onClick={() => loadQuiz(note.id)}>
                  Start quiz →
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // ─── Render quiz ───
  const renderQuiz = () => (
    <div className="card quiz-question my-4 shadow">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">🎯 Quiz Time!</h5>
        <button className="btn-close" onClick={() => setActiveQuiz(null)}></button>
      </div>
      <div className="card-body">
        {activeQuiz.questions.map((q, i) => (
          <div key={q.id} className="mb-4">
            <p className="fw-semibold">Q{i + 1}: {q.question}</p>
            {Object.entries(q.options || {}).map(([key, value]) => (
              <div className="form-check" key={key}>
                <input
                  className="form-check-input"
                  type="radio"
                  name={`q-${q.id}`}
                  id={`q-${q.id}-opt-${key}`}
                  value={key}
                  onChange={() => setUserAnswers((prev) => ({ ...prev, [q.id]: key }))}
                  checked={userAnswers[q.id] === key}
                />
                <label className="form-check-label" htmlFor={`q-${q.id}-opt-${key}`}>
                  <strong>{key}.</strong> {value}
                </label>
              </div>
            ))}
          </div>
        ))}
        <div className="d-flex justify-content-between">
          <button className="btn btn-outline-secondary" onClick={() => setActiveQuiz(null)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleQuizSubmit}>
            🚀 Submit Answers
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Render quiz result ───
  const renderQuizResult = () => (
    <div className="card shadow my-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">📊 Quiz Result</h5>
        <button className="btn-close" onClick={() => setQuizResult(null)}></button>
      </div>
      <div className="card-body text-center">
        {/* Score circle */}
        <div
          className="result-circle mx-auto mb-3"
          style={{ "--progress": `${quizResult.score}%` }}
        >
          <div className="result-circle-inner">{quizResult.score}%</div>
        </div>

        <h5>
          {quizResult.score >= 80 ? "Excellent! 🎉"
            : quizResult.score >= 60 ? "Good Job! 👍"
            : "Keep Practicing! 💪"}
        </h5>

        {/* Per-topic scores */}
        {quizResult.perTopic && Object.keys(quizResult.perTopic).length > 0 && (
          <>
            <hr />
            <h6 className="fw-semibold">Performance by Topic:</h6>
            <ul className="list-unstyled">
              {Object.entries(quizResult.perTopic).map(([topic, score]) => (
                <li key={topic}>
                  <strong>{topic}:</strong> {score}%
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Explanations */}
        <hr />
        {(quizResult.explanations || []).map((exp, i) => (
          <div
            key={i}
            className={`p-3 rounded mb-3 text-start ${exp.isCorrect ? "bg-success-light" : "bg-danger-light"}`}
          >
            <p className="fw-bold mb-1">
              Q{i + 1}: {exp.question}{" "}
              {exp.isCorrect
                ? <span className="text-success ms-1">✔️</span>
                : <span className="text-danger ms-1">❌</span>}
            </p>
            <p className="mb-1">
              Your Answer:{" "}
              <span className={exp.isCorrect ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                {exp.userAnswer || "Not answered"}
              </span>
            </p>
            <p className="mb-1">
              Correct Answer: <span className="text-success fw-bold">{exp.correctAnswer}</span>
            </p>
            {exp.explanation && (
              <p className="mt-2 mb-0"><em>💡 {exp.explanation}</em></p>
            )}
          </div>
        ))}

        {/* Study plan prompt */}
        <hr />
        <div className="mt-3">
          {planChecking ? (
            <div className="d-inline-flex align-items-center">
              <div className="spinner-border me-2" role="status" />
              <span>Checking your study plan…</span>
            </div>
          ) : (
            <>
              <div className="alert alert-info mb-3">
                📅 Turn this quiz result into a personalized study plan.
              </div>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    goToStudyPlan("note_quiz", [planPrompt?.noteId || activeQuiz?.noteId])
                  }
                >
                  📅 Create Study Plan
                </button>
                <Link to="/study-plan" className="btn btn-outline-secondary">
                  View My Study Plans
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Main render ───
  return (
    <div className="notes-upload-container">
      <h2 className="text-center mb-4">📚 Notes Dashboard</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError("")}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
        </div>
      )}

      {/* Upload box */}
      <div className="card shadow mb-4">
        <div className="card-header fw-semibold">📤 Upload New Note</div>
        <div className="card-body text-center">
          <div className="upload-box">
            <input
              type="file"
              ref={fileInputRef}
              className="form-control mb-3"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.docx,.txt"
            />
            <p className="text-muted small mb-3">Supported: PDF, DOCX, TXT</p>
            <button
              onClick={handleUpload}
              className="btn btn-primary"
              disabled={uploading || !file}
            >
              {uploading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Uploading...</>
                : "🚀 Upload & Process"}
            </button>
          </div>
        </div>
      </div>

      {/* Notes list / quiz / result */}
      {activeQuiz ? (
        renderQuiz()
      ) : quizResult ? (
        renderQuizResult()
      ) : (
        <div className="card shadow">
          <div className="card-header fw-semibold">📄 Your Notes</div>
          <div className="card-body">
            {loadingNotes ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary"></div>
                <p className="mt-2 text-muted">Loading your notes...</p>
              </div>
            ) : notes.length > 0 ? (
              <div className="list-group list-group-flush">
                {notes.map((n) => renderNote(n))}
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-journal-bookmark text-muted" style={{ fontSize: "3rem" }}></i>
                <h5 className="mt-3">No notes uploaded yet</h5>
                <p className="text-muted">Upload your first PDF, DOCX, or TXT file to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesUpload;