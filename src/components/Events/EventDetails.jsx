import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEventById, deleteEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Header from '../Header.jsx';
import { queryClient } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEventById({ id }, { signal }),
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  const { mutate, isPending: isDeletePending, isError: isErrorDeleting, error: deleteError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' });
      navigate('/events');
    },
  });

  function handleDelete(id) {
    mutate({ id: id });
  }


  if (isError) {
    return (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch events.'} />
    );
  }

  if (isPending) {
    return (
      <LoadingIndicator />
    );
  }

  return (data &&
    <>
      {isDeleting &&
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event? This action cannot be undone.</p>
          <div className='form-actions'>
            {isDeletePending && <p>Deleting...</p>}
            {!isDeletePending && (
              <>
                <button onClick={handleStopDelete} className='button-text'>Cancel</button>
                <button onClick={() => handleDelete(id)} disabled={isDeletePending} className='button'>Delete</button>
              </>
            )}
            {isErrorDeleting && <ErrorBlock title='Failed to delete event' message={deleteError.info?.message || 'An error occurred while deleting the event.'} />}
          </div>
        </Modal>
      }
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to={`/events/${id}/edit`}>Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    </>
  );
}
