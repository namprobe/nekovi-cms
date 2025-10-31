"use client";

import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-pink-500 text-white pt-10 pb-4">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Cột 1 */}
                <div className="space-y-3">
                    <h2 className="font-bold text-lg">NekoVi</h2>
                    {/* Phone */}
                    <div className="flex items-center gap-2">
                        <img src="/icons/phone.png" alt="phone" className="h-6 w-6" />
                        <span>+8801611112222</span>
                    </div>
                    {/* Email */}
                    <div className="flex items-center gap-2">
                        <img src="/icons/email.png" alt="email" className="h-6 w-6" />
                        <span>Nekovi@gmail.com</span>
                    </div>
                </div>

                {/* Cột 2 */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <p>NekoVi</p>
                        <p>Câu chuyện</p>
                        <p>Liên lạc</p>
                        <p>Chọn Anime</p>
                    </div>
                    <div className="space-y-2">
                        <p>Sản phẩm</p>
                        <p>Kimetsu no Yaiba</p>
                        <p>One Piece</p>
                        <p>Jujutsu Kaisen</p>
                        <p>Naruto</p>
                        <p>The Boy and the Hero</p>
                    </div>
                    <div className="space-y-2">
                        <p>Thêm</p>
                        <p>Tài khoản</p>
                        <p>Giỏ hàng</p>
                        <p>Bán Hàng</p>
                    </div>
                </div>

                {/* Cột 3 */}
                <div className="flex items-center gap-4">
                    <Facebook className="cursor-pointer hover:text-white" />
                    <Instagram className="cursor-pointer hover:text-white" />
                    <Twitter className="cursor-pointer hover:text-white" />
                </div>
            </div>

            {/* Dòng cuối */}
            <div className="text-center mt-6 text-sm text-white/80">
                All rights reserved @Nekovi.com
            </div>
        </footer>
    );
}
