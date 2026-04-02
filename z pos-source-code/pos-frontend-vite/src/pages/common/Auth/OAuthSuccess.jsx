import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { getUserProfile } from '../../../Redux Toolkit/features/user/userThunks';
import { startShift } from '../../../Redux Toolkit/features/shiftReport/shiftReportThunks';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { toast } = useToast();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            localStorage.setItem('jwt', token);
            dispatch(getUserProfile(token))
                .unwrap()
                .then((user) => {
                    toast({
                        title: "Success",
                        description: "Login successful!",
                    });
                    
                    const userRole = user.role;
                    if (userRole === 'ROLE_BRANCH_CASHIER') {
                        navigate('/cashier');
                        if (user.branchId) {
                            dispatch(startShift(user.branchId));
                        }
                    } else if (userRole === 'ROLE_STORE_ADMIN' || userRole === 'ROLE_STORE_MANAGER') {
                        navigate('/store');
                    } else if (userRole === 'ROLE_BRANCH_MANAGER' || userRole === 'ROLE_BRANCH_ADMIN') {
                        navigate('/branch');
                    } else {
                        navigate('/');
                    }
                })
                .catch((error) => {
                    toast({
                        title: "Error",
                        description: "Failed to fetch user profile",
                        variant: "destructive",
                    });
                    navigate('/auth/login');
                });
        } else {
            navigate('/auth/login');
        }
    }, [searchParams, dispatch, navigate, toast]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-xl p-8 flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold text-foreground">Completing sign in...</h2>
                <p className="text-muted-foreground mt-2">Please wait while we redirect you.</p>
            </div>
        </div>
    );
};

export default OAuthSuccess;
