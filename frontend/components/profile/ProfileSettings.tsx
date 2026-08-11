"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  KeyRound,
  Loader2,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { api, getErrorMessage } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserRole = "professor" | "student";

type Profile = {
  id: number;
  name: string;
  email: string;
  nim: string | null;
  class_: string | null;
  role: UserRole;
  department: string | null;
  study_program: string | null;
};

type ProfileResponse = {
  message?: string;
  profile: Profile;
};

type ProfileForm = {
  name: string;
  email: string;
  nim: string;
  class_: string;
  department: string;
  study_program: string;
};

type PasswordForm = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

type Copy = {
  title: string;
  description: string;
  accountTitle: string;
  accountDescription: string;
  passwordTitle: string;
  passwordDescription: string;
  name: string;
  email: string;
  nim: string;
  className: string;
  department: string;
  studyProgram: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  saveProfile: string;
  savingProfile: string;
  changePassword: string;
  changingPassword: string;
  loadError: string;
  profileError: string;
  passwordError: string;
  professor: string;
  student: string;
  securityNote: string;
};

const copy: Copy = {
  title: "Profil Saya",
  description: "Kelola informasi akun dan keamanan password Anda.",
  accountTitle: "Informasi Profil",
  accountDescription: "Perbarui data yang digunakan di dalam LMS.",
  passwordTitle: "Ganti Password",
  passwordDescription: "Gunakan minimal 8 karakter untuk password baru.",
  name: "Nama lengkap",
  email: "Email",
  nim: "NIM",
  className: "Kelas",
  department: "Jurusan",
  studyProgram: "Program studi",
  currentPassword: "Password saat ini",
  newPassword: "Password baru",
  confirmPassword: "Konfirmasi password baru",
  saveProfile: "Simpan profil",
  savingProfile: "Menyimpan...",
  changePassword: "Ganti password",
  changingPassword: "Memperbarui...",
  loadError: "Profil gagal dimuat.",
  profileError: "Profil gagal diperbarui.",
  passwordError: "Password gagal diperbarui.",
  professor: "Dosen",
  student: "Mahasiswa",
  securityNote:
    "Password saat ini wajib dimasukkan untuk melindungi akun Anda.",
};

const emptyProfileForm: ProfileForm = {
  name: "",
  email: "",
  nim: "",
  class_: "",
  department: "",
  study_program: "",
};

const emptyPasswordForm: PasswordForm = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

function profileToForm(profile: Profile): ProfileForm {
  return {
    name: profile.name ?? "",
    email: profile.email ?? "",
    nim: profile.nim ?? "",
    class_: profile.class_ ?? "",
    department: profile.department ?? "",
    study_program: profile.study_program ?? "",
  };
}

export default function ProfileSettings() {

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm);
  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(emptyPasswordForm);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const { data } = await api.get<ProfileResponse>("/api/profile");

        if (!active) return;

        setProfile(data.profile);
        setProfileForm(profileToForm(data.profile));
      } catch (error) {
        if (!active) return;
        setLoadError(getErrorMessage(error, copy.loadError));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [copy.loadError]);

  const updateProfileField = (field: keyof ProfileForm, value: string) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!profile) {
      setProfileError(copy.loadError);
      return;
    }

    setProfileSaving(true);
    setProfileError("");

    try {
      const isStudent = profile.role === "student";

      const payload = {
        ...profileForm,
        nim: isStudent ? profileForm.nim : null,
        class_: isStudent ? profileForm.class_ : null,
      };

      const { data } = await api.patch<ProfileResponse>(
        "/api/profile",
        payload,
      );

      setProfile(data.profile);
      setProfileForm(profileToForm(data.profile));
      toast.success(data.message ?? copy.saveProfile);
    } catch (error) {
      setProfileError(getErrorMessage(error, copy.profileError));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setPasswordSaving(true);
    setPasswordError("");

    try {
      const { data } = await api.put<{ message?: string }>(
        "/api/profile/password",
        passwordForm,
      );

      setPasswordForm(emptyPasswordForm);
      toast.success(data.message ?? copy.changePassword);
    } catch (error) {
      setPasswordError(getErrorMessage(error, copy.passwordError));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-[#0D542B]" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{loadError || copy.loadError}</AlertDescription>
      </Alert>
    );
  }

  const roleLabel =
    profile.role === "professor" ? copy.professor : copy.student;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172B] via-[#0D542B] to-[#004F3B] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
            <UserRound className="h-10 w-10" />
          </div>
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" />
              {roleLabel}
            </div>
            <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 text-white/75">{copy.description}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <Card className="rounded-3xl border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-[#0D542B]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{copy.accountTitle}</CardTitle>
                <CardDescription className="mt-1">
                  {copy.accountDescription}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {profileError && (
                <Alert variant="destructive">
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-name">{copy.name}</Label>
                  <Input
                    id="profile-name"
                    value={profileForm.name}
                    onChange={(event) =>
                      updateProfileField("name", event.target.value)
                    }
                    required
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-email">{copy.email}</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(event) =>
                      updateProfileField("email", event.target.value)
                    }
                    required
                    maxLength={255}
                  />
                </div>

                {profile.role === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="profile-nim">{copy.nim}</Label>
                      <Input
                        id="profile-nim"
                        value={profileForm.nim}
                        onChange={(event) =>
                          updateProfileField("nim", event.target.value)
                        }
                        maxLength={50}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-class">{copy.className}</Label>
                      <Input
                        id="profile-class"
                        value={profileForm.class_}
                        onChange={(event) =>
                          updateProfileField("class_", event.target.value)
                        }
                        maxLength={50}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="profile-department">{copy.department}</Label>
                  <Input
                    id="profile-department"
                    value={profileForm.department}
                    onChange={(event) =>
                      updateProfileField("department", event.target.value)
                    }
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-study-program">
                    {copy.studyProgram}
                  </Label>
                  <Input
                    id="profile-study-program"
                    value={profileForm.study_program}
                    onChange={(event) =>
                      updateProfileField("study_program", event.target.value)
                    }
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="min-w-40 bg-[#0D542B] hover:bg-[#0A3F21]"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {copy.savingProfile}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {copy.saveProfile}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit rounded-3xl border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{copy.passwordTitle}</CardTitle>
                <CardDescription className="mt-1">
                  {copy.passwordDescription}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {passwordError && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm text-amber-900">
                {copy.securityNote}
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">{copy.currentPassword}</Label>
                <Input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.current_password}
                  onChange={(event) =>
                    updatePasswordField("current_password", event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">{copy.newPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.password}
                  onChange={(event) =>
                    updatePasswordField("password", event.target.value)
                  }
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">{copy.confirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.password_confirmation}
                  onChange={(event) =>
                    updatePasswordField(
                      "password_confirmation",
                      event.target.value,
                    )
                  }
                  required
                  minLength={8}
                />
              </div>

              <Button
                type="submit"
                disabled={passwordSaving}
                className="w-full bg-[#0F172B] hover:bg-[#1E293B]"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {copy.changingPassword}
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    {copy.changePassword}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
