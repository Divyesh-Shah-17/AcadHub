import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, ShieldAlert, CheckCircle, Lock } from 'lucide-react';

export const StudentTeacherReview = () => {
  const { apiFetch, activeYear, reviewsTriggered } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reviewsTriggered) {
      fetchTeachers();
    } else {
      setLoading(false);
    }
  }, [activeYear, reviewsTriggered]);

  const fetchTeachers = async () => {
    try {
      const res = await apiFetch('/api/student/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
        if (data.length > 0) {
          setSelectedTeacher(data[0].id);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedTeacher || !reviewText.trim()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiFetch('/api/student/reviews', {
        method: 'POST',
        body: JSON.stringify({
          teacherId: Number(selectedTeacher),
          rating: Number(rating),
          feedbackText: reviewText
        })
      });
      if (res.ok) {
        setMessage('Teacher evaluation review submitted anonymously');
        setReviewText('');
        setRating(5);
      } else {
        setError('Failed to submit evaluation review');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!reviewsTriggered) {
    return (
      <div className="space-y-8 animate-fade-in max-w-2xl mx-auto text-center py-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
            <Lock className="h-8 w-8 text-rose-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Evaluations Locked</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              The end-of-project review form is not currently open for submission.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teacher Evaluation Form</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Submit completely anonymous feedback regarding teaching staff performance</p>
      </div>

      {(message || error) && (
        <div className="space-y-2">
          {message && (
            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-md flex items-start space-x-3" role="status">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-emerald-800">{message}</p>
            </div>
          )}
          {error && (
            <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-md flex items-start space-x-3" role="alert">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-rose-800">{error}</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <Star className="h-5 w-5 text-indigo-500" />
          <span>Evaluation Questionnaire</span>
        </h2>

        {teachers.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No teaching staff allocated to evaluate for this term.</p>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div>
              <label htmlFor="teacher-select" className="block text-sm font-semibold text-slate-700 mb-2">Select Evaluator</label>
              <select
                id="teacher-select"
                required
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-12"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.user.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rating-select" className="block text-sm font-semibold text-slate-700 mb-2">Numeric Rating</label>
              <select
                id="rating-select"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-12 font-bold text-indigo-600"
              >
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="review-desc-input" className="block text-sm font-semibold text-slate-700 mb-2">Feedback & Comments</label>
              <textarea
                id="review-desc-input"
                required
                rows="4"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your anonymous comments and constructive feedback regarding classroom and milestone management..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors h-12 flex items-center justify-center text-sm"
            >
              Submit Anonymous Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentTeacherReview;
