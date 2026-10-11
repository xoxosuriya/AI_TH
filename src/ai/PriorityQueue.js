// Binary Min-Heap Priority Queue for A* pathfinding
export class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    
    // Get parent index
    _getParentIndex(i) {
        return Math.floor((i - 1) / 2);
    }
    
    // Get left child index
    _getLeftChildIndex(i) {
        return 2 * i + 1;
    }
    
    // Get right child index
    _getRightChildIndex(i) {
        return 2 * i + 2;
    }
    
    // Swap elements
    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }
    
    // Heapify up
    _heapifyUp(index) {
        let currentIndex = index;
        let parentIndex = this._getParentIndex(currentIndex);
        
        while (
            currentIndex > 0 &&
            this.heap[currentIndex].priority < this.heap[parentIndex].priority
        ) {
            this._swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
            parentIndex = this._getParentIndex(currentIndex);
        }
    }
    
    // Heapify down
    _heapifyDown(index) {
        let currentIndex = index;
        while (this._getLeftChildIndex(currentIndex) < this.heap.length) {
            let smallestChildIndex = this._getLeftChildIndex(currentIndex);
            const rightChildIndex = this._getRightChildIndex(currentIndex);
            
            if (
                rightChildIndex < this.heap.length &&
                this.heap[rightChildIndex].priority < this.heap[smallestChildIndex].priority
            ) {
                smallestChildIndex = rightChildIndex;
            }
            
            if (this.heap[currentIndex].priority < this.heap[smallestChildIndex].priority) {
                break;
            }
            
            this._swap(currentIndex, smallestChildIndex);
            currentIndex = smallestChildIndex;
        }
    }
    
    // Enqueue an item with priority
    enqueue(item, priority) {
        this.heap.push({ item, priority });
        this._heapifyUp(this.heap.length - 1);
    }
    
    // Dequeue the item with highest priority (lowest value)
    dequeue() {
        if (this.isEmpty()) {
            return null;
        }
        
        if (this.heap.length === 1) {
            return this.heap.pop().item;
        }
        
        const topItem = this.heap[0].item;
        this.heap[0] = this.heap.pop();
        this._heapifyDown(0);
        return topItem;
    }
    
    // Check if queue is empty
    isEmpty() {
        return this.heap.length === 0;
    }
    
    // Get size of queue
    size() {
        return this.heap.length;
    }
    
    // Peek at the top item without removing it
    peek() {
        if (this.isEmpty()) {
            return null;
        }
        return this.heap[0].item;
    }
}

