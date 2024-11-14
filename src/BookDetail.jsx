// src/BookDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import { generateClient } from "aws-amplify/data";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [name, setName] = useState("");
  const [notes, setNotes] = useState([]);

  const client = generateClient({
    authMode: "userPool",
  });

  function stripHTML(html) {
  const tempDivElement = document.createElement('div');
  tempDivElement.innerHTML = html;
  return tempDivElement.textContent || tempDivElement.innerText || '';
}
  

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        /*
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          console.log(linkToStorageFile.url);
          note.image = linkToStorageFile.url;
        }
        */
        return note;
      })
    );
    console.log(notes);
    setNotes(notes);
  }
  useEffect(() => {
    
    
    // Fetch book details directly from Google Books API
    const fetchBook = async () => {
      try {
        const parameters = {
          key: 'AIzaSyBb_w6EWijM0kL66MeJSLS_sAggv4O7vJ8', // Replace with your actual API key
        };
        const params = new URLSearchParams(parameters).toString();
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${id}?${params}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const item = await response.json();

        const volumeInfo = item.volumeInfo || {};

        const bookData = {
          id: item.id || 'N/A',
          title: volumeInfo.title || 'N/A',
          authors: volumeInfo.authors || ['Unknown Author'],
          publisher: volumeInfo.publisher || 'Unknown Publisher',
          published_date: volumeInfo.publishedDate || 'Unknown Date',
          description: volumeInfo.description
          ? stripHTML(volumeInfo.description)
          : 'No description available.',
          page_count: volumeInfo.pageCount || 'Unknown Page Count',
          categories: volumeInfo.categories || ['No categories available'],
          average_rating: volumeInfo.averageRating || 'No rating',
          ratings_count: volumeInfo.ratingsCount || 'No ratings count',
          thumbnail: volumeInfo.imageLinks
            ? volumeInfo.imageLinks.thumbnail
            : 'https://via.placeholder.com/128x192?text=No+Image',
          small_thumbnail: volumeInfo.imageLinks
            ? volumeInfo.imageLinks.smallThumbnail
            : 'https://via.placeholder.com/128x192?text=No+Image',
        };

        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book data:', error);
      }
    };

    fetchBook();
    fetchNotes();
  }, [id]);

  if (!book) {
    return (
      <>
        <Navbar />
        <div className="text-center mt-10">Loading...</div>
      </>
    );
  }
  
    
  
    
  
    async function createNote(event) {
      event.preventDefault();
      const form = new FormData(event.target);
      //console.log(form.get("image").name);
  
      const { data: newNote } = await client.models.Note.create({
        name: book.title,
        description: reviewText,
        rating,
      });
  
      console.log(newNote);
      /*
      if (newNote.image)
        if (newNote.image)
          await uploadData({
            path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
  
            data: form.get("image"),
          }).result;
          */
  
      fetchNotes();
      event.target.reset();
    }
  
    async function deleteNote({ id }) {
      const toBeDeletedNote = {
        id: id,
      };
  
      const { data: deletedNote } = await client.models.Note.delete(
        toBeDeletedNote
      );
      console.log(deletedNote);
  
      fetchNotes();
    }
  const handleReviewSubmit = (e) => {
    e.preventDefault();

    console.log('Review submitted:', reviewText, rating);

    setShowReviewPopup(false);
    setReviewText('');
    setRating(1);
  };

  

  return (
    <>
      <Navbar />
      <div className="book-detail-container">
        <div className="book-image-container">
          <img
            src={
              book.thumbnail ||
              'https://via.placeholder.com/128x192?text=No+Image'
            }
            alt={book.title}
            className="book-image"
          />
        </div>
        <div className="book-content-container">
          <h1 className="book-title">{book.title || 'No Title Available'}</h1>
          <p className="book-author">
            By {book.authors ? book.authors.join(', ') : 'Unknown Author'}
          </p>
          <p className="book-published">
            Published: {book.published_date || 'Unknown'}
          </p>
          <p className="book-description">
            {book.description || 'No description available.'}
          </p>
          {/* ... Other book details ... */}
          <div className="action-buttons-container">
            <button className="action-button">Like</button>
            <button
              className="write-review-button"
              onClick={() => setShowReviewPopup(true)}
            >
              Write a Review
            </button>
            <button className="action-button">Add to Watchlist</button>
          </div>
        </div>
      </div>

      <div className="reviews-container">
        <h2 className="reviews-title">Reviews:</h2>
        <div className="reviews-scrollable-container">
        {notes.length > 0 ? (
            notes
            .filter((note) => note.name === book.title)
            .map((note) => (
            <div key={note.id} className="review-item">
              <h3 className="reviewer-name">{note.name}</h3>
              <p className="review-text">{note.description}</p>
              <p className="review-rating">Rating: {note.rating}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
      </div>

      {showReviewPopup && (
        <div className="review-popup-overlay">
          <div className="review-popup-content">
            <button
              className="close-button"
              onClick={() => setShowReviewPopup(false)}
            >
              X
            </button>
            <h2 className="popup-title">Write a Review</h2>
            <form onSubmit={createNote}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required
                />
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="5"
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Rating:</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="form-select"
                  required
                >
                  {['1', '2', '3', '4', '5'].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-review-button">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}