<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $createResetUrl = static function (object $notifiable, string $token): string {
            $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

            return $frontendUrl.'/id/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ]);
        };

        ResetPassword::createUrlUsing($createResetUrl);

        ResetPassword::toMailUsing(
            function (object $notifiable, string $token) use ($createResetUrl): MailMessage {
                $expireMinutes = (int) config('auth.passwords.users.expire', 60);
                $name = trim((string) ($notifiable->name ?? ''));
                $greeting = $name !== '' ? "Halo, {$name}!" : 'Halo!';

                return (new MailMessage)
                    ->subject('Atur Ulang Kata Sandi | LMS Prof. Noor')
                    ->greeting($greeting)
                    ->line('Kami menerima permintaan untuk mengatur ulang kata sandi akun LMS Prof. Noor Anda.')
                    ->line('Klik tombol di bawah ini untuk membuat kata sandi baru.')
                    ->action('Atur Ulang Kata Sandi', $createResetUrl($notifiable, $token))
                    ->line("Link ini akan kedaluwarsa dalam {$expireMinutes} menit.")
                    ->line('Jika Anda tidak merasa meminta pengaturan ulang kata sandi, abaikan email ini. Akun Anda tetap aman dan tidak ada perubahan yang dilakukan.')
                    ->salutation('Salam, LMS Prof. Noor');
            }
        );
    }
}
