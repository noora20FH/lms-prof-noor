<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ForgotPasswordController extends Controller
{

    public function sendResetLink(Request $request)
    {

        $request->validate([
            'email'=>[
                'required',
                'email'
            ]
        ]);


        $status = Password::sendResetLink(
            $request->only('email')
        );


        if($status === Password::RESET_LINK_SENT){

            return response()->json([
                'message'=>'Link reset password berhasil dikirim.'
            ]);

        }


        return response()->json([
            'message'=>'Email tidak ditemukan.'
        ],422);

    }



    public function reset(Request $request)
    {

        $request->validate([

            'token'=>'required',

            'email'=>'required|email',

            'password'=>'required|min:8|confirmed'

        ]);



        $status = Password::reset(

            $request->only(
                'email',
                'password',
                'password_confirmation',
                'token'
            ),

            function(User $user,$password){

                $user->password =
                    Hash::make($password);

                $user->save();

            }

        );



        if($status === Password::PASSWORD_RESET){

            return response()->json([
                'message'=>'Password berhasil diperbarui.'
            ]);

        }


        return response()->json([
            'message'=>'Token tidak valid.'
        ],422);

    }

}
