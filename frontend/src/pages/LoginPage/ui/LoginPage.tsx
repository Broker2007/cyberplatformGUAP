// pages/LoginPage/ui/LoginPage.tsx
import { styled } from '@mui/material/styles';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { object, string, TypeOf } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoadingButton as _LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import FormInput from 'shared/ui/FormInput/FormInput';
import { classNames } from 'shared/lib/classNames/classNames';
import Logo from 'shared/assets/icons/logo.svg';
import { Button } from 'shared/ui/Button/Button';
import { ThemeButton } from 'shared/ui/Button/ThemeButton';
import BackIcon from 'shared/assets/icons/arrow_left2.svg';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';
import { useDispatch } from 'react-redux';
import { useLoginUserMutation } from 'features/auth/api/authApi';
import { useGetMeQuery } from 'entities/user/api/userApi';
import { userActions } from 'entities/user';
import { Loader } from 'shared/ui/Loader/Loader';
import cls from './LoginPage.module.scss';

const LoadingButton = styled(_LoadingButton)`
  margin-top: 5px;
  margin-bottom: 0;
  height: 57px;
  display: flex;
  justify-content: center;
  width: 100%;
  color: white;
  font-weight: 400;
  font-size: 16px;
  border-radius: 20px;
  text-transform: none;


  &:disabled {
    opacity: 0.6;
  }
`;

const LinkItem = styled(Link)`
  color: #5c8662 !important;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const loginSchema = object({
    email: string()
        .min(1, 'Email address is required')
        .email('Email Address is invalid'),
    password: string()
        .min(1, 'Password is required')
        .min(8, 'Password must be more than 8 characters')
        .max(32, 'Password must be less than 32 characters'),
});

export type LoginInput = TypeOf<typeof loginSchema>;

const LoginPage = () => {
    const methods = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const [loginUser, {
        isLoading, isError, error, isSuccess, data,
    }] = useLoginUserMutation();

    const { data: user, isLoading: isUserLoading } = useGetMeQuery();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const from = ((location.state as any)?.from?.pathname as string) || '/profile';

    const {
        reset,
        handleSubmit,
        formState: { isSubmitSuccessful },
    } = methods;

    useEffect(() => {
        if (user) {
            navigate('/profile', { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        if (isSuccess) {
            toast.success('You successfully logged in');
            navigate(from, { replace: true });
        }

        if (isError) {
            if (Array.isArray((error as any).data?.error)) {
                (error as any).data.error.forEach((el: any) => toast.error(el.message, { position: 'top-right' }));
            } else {
                toast.error((error as any).data?.message || 'Login failed', {
                    position: 'top-right',
                });
            }
        }
    }, [isSuccess, isError, error, data, dispatch, navigate, from]);

    useEffect(() => {
        if (isSubmitSuccessful) {
            reset();
        }
    }, [isSubmitSuccessful, reset]);

    const onSubmitHandler: SubmitHandler<LoginInput> = async (values) => {
        try {
            await loginUser(values).unwrap();
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    if (isUserLoading) {
        return (
            <div className="d-f jc-cen ai-cen w-100 h-100">
                <PageLoader />
            </div>
        );
    }

    if (user) {
        return null;
    }

    return (
        <div className={classNames(cls.ModalIntel, {}, [])}>
            <div className={cls.glow_left} />
            <div className={cls.glow_right} />

            <Button
                theme={ThemeButton.INLINE}
                className={cls.back_btn}
                onClick={() => navigate('/')}
            >
                <BackIcon className={cls.arrow_icon} />
                <p className={cls.text_arrow_btn}>Назад</p>
            </Button>

            <div className={cls.modal_container}>
                <div className="d-f jc-cen ai-cen">
                    <div className={cls.main_form}>
                        <div className={cls.block_logo}>
                            <Logo className={cls.logo} />
                        </div>
                        <p className={cls.text_hello}>Рады вас снова видеть!</p>
                        <p className={cls.register_text}>
                            В первый раз?
                            <LinkItem to="/register"> Зарегистрируйтесь </LinkItem>
                            {' '}
                            бесплатно
                        </p>
                        <FormProvider {...methods}>
                            <form
                                onSubmit={handleSubmit(onSubmitHandler)}
                                noValidate
                                autoComplete="off"
                                className={cls.form}
                            >
                                <div className={cls.inputs_container}>
                                    <FormInput name="email" type="email" placeholder="Ваша почта" />
                                    <FormInput name="password" type="password" placeholder="Пароль" />
                                </div>
                                <LoadingButton
                                    fullWidth
                                    disableElevation
                                    type="submit"
                                    loading={isLoading}
                                    className={cls.login_button}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader /> : 'Войти'}
                                </LoadingButton>
                            </form>
                        </FormProvider>
                    </div>
                </div>

                <div className={cls.block2}>
                    <span className={cls.line} />
                    <div className="d-f jc-cen ai-cen">
                        <p className={cls.polit}>
                            Нажимая «Войти», вы принимаете пользовательское соглашение и политику
                            конфиденциальности
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
