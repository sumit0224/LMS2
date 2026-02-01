import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import loginImage from '../assets/login_side_tech.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password, role);
        setLoading(false);
        if (result.success) {
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'teacher') navigate('/teacher/dashboard');
            else navigate('/student/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[var(--color-background)]">
            {/* Left Side - Form */}
            <div className="flex w-full lg:w-1/2 justify-center items-center px-8 lg:px-16 relative">
                <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                    <div className="text-center">
                        <h1 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text mb-2 tracking-tighter">APPWARS</h1>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Welcome Back</h2>
                        <p className="text-[var(--color-text-secondary)] mt-2">Enter your credentials to access the portal.</p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">I am a</label>
                            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
                                {['user', 'teacher', 'admin'].map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`py-2 text-sm font-medium rounded-md transition-all duration-200 capitalize ${role === r
                                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200'
                                                : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {r === 'user' ? 'Student' : r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@appwars.com"
                        />

                        <div className="space-y-1">
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                            <div className="flex justify-end">
                                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 text-lg shadow-indigo-500/25 shadow-lg"
                            isLoading={loading}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="text-center text-sm text-[var(--color-text-secondary)]">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Create Account
                        </Link>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            </div>

            {/* Right Side - Image/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0f172a] text-white overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-10"></div>

                {/* Abstract Tech Background */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }}></div>

                <div className="relative z-20 text-center px-12 max-w-lg">
                    <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
                        <span className="text-4xl">🚀</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-6 leading-tight">Master the Future of Technology</h2>
                    <p className="text-lg text-indigo-100/80 leading-relaxed">
                        Join AppWars Technologies to accelerate your career with industry-leading courses and hands-on projects.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
