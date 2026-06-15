import Link from 'next/link';

export function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="row align-items-center flex-row-reverse">
          <div className="col-md-12 col-sm-12 text-center">
            Copyright © <span suppressHydrationWarning>{year}</span>{' '}
            <Link href="/">LawyerSpot</Link>. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
