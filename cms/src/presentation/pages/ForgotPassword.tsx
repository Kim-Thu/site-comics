import axios from 'axios';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:3001/auth/forgot-password', {
                email,
            });
            setSent(true);
            toast.success('Yêu cầu đã được gửi! Vui lòng kiểm tra email.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070708] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_#070708_70%)] font-inter">
            <div className="max-w-xl mx-auto animate-fade-in animate-zoom-in">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 shadow-2xl shadow-indigo-500/30 mb-6 transition-all hover:scale-110">
                        <span className="text-4xl font-black italic text-white/95 font-inter">TM</span>
                    </div>
                    <h1 className="text-3xl font-black text-white font-outfit tracking-tight mb-2 uppercase">
                        Truyen<span className="text-indigo-500">Moi</span>
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase">Khôi phục mật khẩu</p>
                </div>

                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl bg-white/[0.02]">
                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 pl-1 uppercase tracking-wider">Email Address</label>
                                <div className="relative group">
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-12 pr-4 h-12 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
                                        placeholder="admin@truyenmoi.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all text-sm"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Gửi yêu cầu
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2">
                                <Send size={24} />
                            </div>
                            <p className="text-sm text-zinc-300">Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến email <b>{email}</b>. Vui lòng kiểm tra hộp thư (và cả thư rác).</p>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs text-zinc-500 hover:text-indigo-400 flex items-center justify-center gap-2 mx-auto transition-colors bg-transparent border-none p-0"
                        >
                            <ArrowLeft size={14} />
                            Quay lại đăng nhập
                        </button>
                    </div>
                </div>

                <p className="text-center mt-8 text-zinc-700 text-[10px] tracking-[0.2em] uppercase font-black">
                    &copy; 2026 TruyenMoi Team
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
