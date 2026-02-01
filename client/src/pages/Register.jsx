import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        courseName: 'General'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/admin/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--color-background)]">
            {/* Left Side - Form */}
            <div className="flex w-full lg:w-1/2 justify-center items-center px-8 lg:px-16 relative py-12">
                <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text mb-2 tracking-tighter">APPWARS</h1>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Create Account</h2>
                        <p className="text-[var(--color-text-secondary)] mt-2">Start your journey with AppWars today.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Create a password"
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a password"
                        />

                        <Button
                            type="submit"
                            className="w-full py-3 text-lg shadow-indigo-500/25 shadow-lg"
                            isLoading={loading}
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="text-center text-sm text-[var(--color-text-secondary)]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#1e1b4b] text-white overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900 via-transparent to-transparent z-10"></div>

                {/* Abstract Geometric Shapes */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="relative z-20 text-center px-12 max-w-lg">
                    <div className="mb-6 inline-block">
                        <span className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-sm font-medium backdrop-blur-sm">
                            New Batch Starting Soon
                        </span>
                    </div>
                    <h2 className="text-4xl font-bold mb-6 leading-tight">Code Your Future</h2>
                    <p className="text-lg text-indigo-200/80 leading-relaxed">
                        "The best way to predict the future is to invent it."
                        <br />
                        <span className="text-sm opacity-70 mt-4 block">- Join 5000+ Students</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
