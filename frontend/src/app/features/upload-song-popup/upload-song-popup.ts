import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
    selector: 'upload-song-popup',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './upload-song-popup.html',
    styleUrl: './upload-song-popup.scss',
})
export class UploadSongPopup {
    @Output() closePopup = new EventEmitter<void>();
    @Output() uploadSuccess = new EventEmitter<void>();

    uploadForm: FormGroup;
    audioFile: File | null = null;
    coverImageFile: File | null = null;
    coverImagePreview: string | null = null;
    isUploading: boolean = false;
    errorMessage: string = '';
    audioFileName: string = '';

    // Upload status states
    uploadStatus: 'idle' | 'analyzing' | 'success' | 'error' = 'idle';
    uploadMessage: string = '';

    genres: string[] = [
        'Rock',
        'Pop',
        'Jazz',
        'Classical',
        'Hip Hop',
        'Electronic',
        'Country',
        'R&B',
        'Reggae',
        'Metal',
        'Folk',
        'Blues',
        'Other'
    ];

    constructor(
        private fb: FormBuilder,
        private api: ApiService
    ) {
        this.uploadForm = this.fb.group({
            title: ['', [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(100)
            ]],
            description: ['', [
                Validators.maxLength(500)
            ]],
            genre: ['', [Validators.required]]
        });
    }

    onAudioFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Validate file type
            const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
            if (!validTypes.includes(file.type)) {
                this.errorMessage = 'Please select a valid audio file (MP3 or WAV)';
                return;
            }

            // Validate file size (max 50MB)
            const maxSize = 50 * 1024 * 1024; // 50MB
            if (file.size > maxSize) {
                this.errorMessage = 'Audio file must be less than 50MB';
                return;
            }

            this.audioFile = file;
            this.audioFileName = file.name;
            this.errorMessage = '';
        }
    }

    onCoverImageSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                this.errorMessage = 'Please select a valid image file (JPG or PNG)';
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.errorMessage = 'Image file must be less than 5MB';
                return;
            }

            this.coverImageFile = file;
            this.errorMessage = '';

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                this.coverImagePreview = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (!this.uploadForm.valid) {
            this.uploadForm.markAllAsTouched();
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        if (!this.audioFile) {
            this.errorMessage = 'Please select an audio file';
            return;
        }

        if (!this.coverImageFile) {
            this.errorMessage = 'Please select a cover image';
            return;
        }

        this.isUploading = true;
        this.uploadStatus = 'analyzing';
        this.uploadMessage = 'Analyzing files with VirusTotal...';
        this.errorMessage = '';

        // Sanitize inputs
        const title = this.sanitizeInput(this.uploadForm.get('title')?.value);
        const description = this.sanitizeInput(this.uploadForm.get('description')?.value);
        const genre = this.uploadForm.get('genre')?.value;

        // Create FormData for multipart upload
        const formData = new FormData();
        formData.append('audioFile', this.audioFile);
        formData.append('coverFile', this.coverImageFile);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('genre', genre);

        // Debug FormData
        console.log('Sending FormData:');
        formData.forEach((value, key) => {
            console.log(key, value);
        });

        this.api.uploadSong(formData).subscribe({
            next: () => {
                this.isUploading = false;
                this.uploadStatus = 'success';
                this.uploadMessage = 'Successfully uploaded!';

                // Wait 2 seconds to show success message, then close
                setTimeout(() => {
                    this.uploadSuccess.emit();
                    this.resetForm();
                    this.closePopup.emit();
                }, 2000);
            },
            error: (err) => {
                this.isUploading = false;
                this.uploadStatus = 'error';

                // Check if it's a malicious file error
                const errorMsg = err.error?.message || 'Failed to upload song. Please try again.';
                if (errorMsg.includes('malicious') || errorMsg.includes('rejected')) {
                    this.uploadMessage = 'Corrupted File';
                    this.errorMessage = 'The file contains malicious content and was rejected.';
                } else {
                    this.uploadMessage = 'Upload Failed';
                    this.errorMessage = errorMsg;
                }

                console.error('Upload error:', err);
            }
        });
    }

    onClose() {
        this.closePopup.emit();
    }

    resetForm() {
        this.uploadForm.reset();
        this.audioFile = null;
        this.coverImageFile = null;
        this.coverImagePreview = null;
        this.audioFileName = '';
        this.errorMessage = '';
        this.uploadStatus = 'idle';
        this.uploadMessage = '';
    }

    /**
     * Sanitize user input to prevent XSS attacks
     */
    private sanitizeInput(input: string): string {
        if (!input) return '';

        return input
            .trim()
            .replace(/[<>]/g, '')           // Remove < and >
            .replace(/javascript:/gi, '')   // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '')     // Remove event handlers
            .substring(0, 500);             // Limit length
    }

    get title() {
        return this.uploadForm.get('title');
    }

    get description() {
        return this.uploadForm.get('description');
    }

    get genre() {
        return this.uploadForm.get('genre');
    }
}
