import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../components/ui/dialog";
import { Lock, Eye, EyeOff } from "lucide-react";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({
    isOpen,
    onClose,
}: ChangePasswordModalProps) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async () => {
        if (newPassword !== confirmPassword) {
            alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }
        if (newPassword.length < 8) {
            alert("비밀번호는 최소 8자 이상이어야 합니다.");
            return;
        }
        if (!/[0-9]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
            alert("비밀번호에는 숫자와 특수문자가 포함되어야 합니다.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8090/api/auth/chgPw?pw=${newPassword}`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {

        }
        alert("비밀번호가 변경되었습니다.");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="
          sm:max-w-md rounded-xl
          bg-white/70 dark:bg-gray-900/70
          backdrop-blur-md shadow-xl border border-white/20
        "
            >
                {/* 헤더 */}
                <DialogHeader className="space-y-1">
                    <DialogTitle className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Lock className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>비밀번호 변경</span>
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        계정의 보안을 위해 주기적으로 비밀번호를 변경하세요.
                    </p>
                </DialogHeader>

                {/* 입력 영역 */}
                <div className="space-y-4 mt-4">
                    {/* 현재 비밀번호 */}
                    <div className="space-y-2">
                        <Label>현재 비밀번호</Label>
                        <div className="relative">
                            <Input
                                type={showOld ? "text" : "password"}
                                placeholder="현재 비밀번호 입력"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowOld(!showOld)}
                            >
                                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* 새 비밀번호 */}
                    <div className="space-y-2">
                        <Label>새 비밀번호</Label>
                        <div className="relative">
                            <Input
                                type={showNew ? "text" : "password"}
                                placeholder="새 비밀번호 입력"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowNew(!showNew)}
                            >
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* 새 비밀번호 확인 */}
                    <div className="space-y-2">
                        <Label>새 비밀번호 확인</Label>
                        <div className="relative">
                            <Input
                                type={showConfirm ? "text" : "password"}
                                placeholder="새 비밀번호 다시 입력"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowConfirm(!showConfirm)}
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 (꽉 찬 스타일) */}
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <DialogFooter className="grid grid-cols-2 gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full h-11 text-gray-600 hover:text-gray-800 hover:bg-transparent rounded-lg"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="
        w-full h-11
        bg-gradient-to-r from-blue-500 to-blue-600
        hover:from-blue-600 hover:to-blue-700
        text-white font-medium
        rounded-lg shadow-sm
      "
                        >
                            변경하기
                        </Button>
                    </DialogFooter>
                </div>

            </DialogContent>
        </Dialog>
    );
}
