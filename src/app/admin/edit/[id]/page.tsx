// app/admin/edit/[id]
'use client'
import React, { useEffect, useState } from 'react';

interface Survey {
    id: string;
    title: string;
    description: string;
    // Add other fields as necessary
}

interface Props {
    id: string;
}

const SurveyDetails: React.FC<Props> = ({ id }) => {
    const [survey, setSurvey] = useState<Survey | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<{ title: string; description: string }>({
        title: '',
        description: '',
    });

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                const response = await fetch(`/api/surveys/${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: Survey = await response.json();
                setSurvey(data);
                setFormData({ title: data.title, description: data.description });
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditToggle = () => {
        setIsEditing((prev) => !prev);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/surveys/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update survey');
            }

            const updatedSurvey = await response.json();
            setSurvey(updatedSurvey);
            setIsEditing(false); // Exit edit mode
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Survey Details</h2>
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description">Description:</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={handleEditToggle}>
                        Cancel
                    </button>
                </form>
            ) : (
                <>
                    <h3>{survey?.title}</h3>
                    <p>{survey?.description}</p>
                    {/* Render other survey fields here */}
                    <button onClick={handleEditToggle}>Edit</button>
                </>
            )}
        </div>
    );
};

export default SurveyDetails;