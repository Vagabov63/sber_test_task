import './skeleton.css';

export default function Skeleton({ count = 6 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="obligationCard skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      ))}
    </>
  );
}