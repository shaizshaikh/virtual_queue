export async function GET() {
    try {
        const response = await fetch('http://localhost:5000/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        
        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
