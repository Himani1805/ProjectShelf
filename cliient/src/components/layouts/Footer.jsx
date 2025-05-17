import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-base-200 text-base-content">
            <div className="container mx-auto px-4 py-10">
                <div className="footer">
                    <div>
                        <span className="footer-title">ProjectShelf</span>
                        <p className="max-w-xs">
                            A modern portfolio platform for designers, developers, and writers to showcase their work.
                        </p>
                    </div>
                    <div>
                        <span className="footer-title">Company</span>
                        <Link to="/about" className="link link-hover">About us</Link>
                        <Link to="/contact" className="link link-hover">Contact</Link>
                        <Link to="/careers" className="link link-hover">Careers</Link>
                        <Link to="/press-kit" className="link link-hover">Press kit</Link>
                    </div>
                    <div>
                        <span className="footer-title">Legal</span>
                        <Link to="/terms" className="link link-hover">Terms of use</Link>
                        <Link to="/privacy" className="link link-hover">Privacy policy</Link>
                        <Link to="/cookies" className="link link-hover">Cookie policy</Link>
                    </div>
                    <div>
                        <span className="footer-title">Newsletter</span>
                        <div className="form-control w-80">
                            <label className="label">
                                <span className="label-text">Enter your email address</span>
                            </label>
                            <div className="relative">
                                <input type="text" placeholder="username@site.com" className="input input-bordered w-full pr-16" />
                                <button className="btn btn-primary absolute top-0 right-0 rounded-l-none">Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="footer footer-center p-4 border-t border-base-300 mt-4">
                    <div>
                        <p>Copyright © {new Date().getFullYear()} - All rights reserved by ProjectShelf</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;