import { Book, Calendar, Eye, TrendingUp, Users } from 'lucide-react';

const StatCard = ({ title, value, icon, bgColor, textColor, trend }: any) => (
    <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl flex items-center justify-between">
        <div>
            <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-zinc-100">{value}</h3>
            {trend && (
                <p className="text-[10px] mt-2 flex items-center gap-1">
                    <span className="text-emerald-500 font-bold">+{trend}%</span>
                    <span className="text-zinc-600">so với tháng trước</span>
                </p>
            )}
        </div>
        <div className={`p-4 rounded-2xl ${bgColor} bg-opacity-10 ${textColor}`}>
            {icon}
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-8 font-inter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2 font-outfit">Xin chào 👋</h1>
                    <p className="text-zinc-500">Hệ thống đang hoạt động bình thường. Chúc bạn một ngày làm việc hiệu quả!</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-zinc-400 text-sm">
                    <Calendar size={16} />
                    <span>{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng truyện"
                    value="156"
                    icon={<Book size={24} />}
                    bgColor="bg-indigo-500"
                    textColor="text-indigo-500"
                    trend="12"
                />
                <StatCard
                    title="Lượt xem"
                    value="1.2M"
                    icon={<Eye size={24} />}
                    bgColor="bg-purple-500"
                    textColor="text-purple-500"
                    trend="8.5"
                />
                <StatCard
                    title="Người dùng"
                    value="45,200"
                    icon={<Users size={24} />}
                    bgColor="bg-pink-500"
                    textColor="text-pink-500"
                    trend="15"
                />
                <StatCard
                    title="Tăng trưởng"
                    value="24.8%"
                    icon={<TrendingUp size={24} />}
                    bgColor="bg-emerald-500"
                    textColor="text-emerald-500"
                    trend="4.2"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl">
                    <h3 className="text-lg font-bold mb-6">Cập nhật gần đây</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-16 bg-zinc-800 rounded-lg overflow-hidden">
                                        <img src={`https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=100`} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-zinc-200">Shadow Blade: Eternal Night</div>
                                        <div className="text-xs text-zinc-500">Chương 15 vừa được đăng bởi Admin</div>
                                    </div>
                                </div>
                                <div className="text-xs text-zinc-600">2 giờ trước</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-[#111114] border border-white/[0.08] rounded-2xl p-6 bg-white/[0.02] backdrop-blur-xl">
                    <h3 className="text-lg font-bold mb-6">Trạng thái Site</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Thời gian phản hồi</span>
                            <span className="text-sm font-bold text-emerald-500">24ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Database (MongoDB)</span>
                            <span className="text-sm font-bold text-emerald-500">Kết nối tốt</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">Gửi mail SMTP</span>
                            <span className="text-sm font-bold text-emerald-500">Sẵn sàng</span>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <button className="w-full bg-white/5 border border-white/10 text-zinc-100 hover:bg-white/10 inline-flex items-center justify-center px-5 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 text-xs">Kiểm tra kết nối</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
